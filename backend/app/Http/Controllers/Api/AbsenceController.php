<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;
use App\Models\Classe;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        $query = Absence::with(['eleve.classes']);

        if ($role === 'ELEVE') {
            $query->where('id_eleve', $user->id);
        }

        if ($role === 'ENSEIGNANT') {
            $query->whereHas('eleve.classes.enseignants', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        if ($request->filled('eleve_id')) {
            $query->where('id_eleve', $request->eleve_id);
        }

        if ($request->filled('classe')) {
            $query->whereHas('eleve.classes', function ($q) use ($request) {
                $q->where('classes.id', $request->classe);
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('date_absence', $request->date);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_absence', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_absence', '<=', $request->date_fin);
        }

        if ($request->filled('est_justifiee')) {
            $query->where('est_justifiee', filter_var($request->est_justifiee, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('eleve', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $absences = $query
            ->orderByDesc('date_absence')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $absences,
            'total' => $absences->count(),
        ]);
    }

    public function store(StoreAbsenceRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $role = $user?->resolvedRole();

        $classe = Classe::with(['enseignants', 'eleves'])->find($data['id_classe']);

        $canManageClass = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)
            || ($classe && $classe->enseignants->contains($user->id));

        if (! $classe || ! $canManageClass) {
            return response()->json([
                'message' => "Accès refusé: vous n'êtes pas affecté à cette classe.",
            ], 403);
        }

        $invalidEleves = collect($data['absents'])
            ->diff($classe->eleves->pluck('id'));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => "Certains élèves ne sont pas inscrits dans cette classe.",
                'invalid_eleve_ids' => $invalidEleves->values(),
            ], 422);
        }

        $created = [];
        $updated = [];

        foreach ($data['absents'] as $eleveId) {
            $absence = Absence::firstOrNew([
                'id_eleve' => $eleveId,
                'date_absence' => $data['date_absence'],
            ]);

            $absence->motif = $data['motif'] ?? $absence->motif;
            $absence->est_justifiee = $absence->exists ? $absence->est_justifiee : false;
            $absence->save();

            if ($absence->wasRecentlyCreated) {
                $created[] = $absence->fresh(['eleve.classes']);
            } else {
                $updated[] = $absence->fresh(['eleve.classes']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Absences enregistrées avec succès.',
            'data' => [
                'created' => $created,
                'updated' => $updated,
            ],
            'total' => count($created) + count($updated),
        ], 201);
    }

    public function byClasse(Request $request, $id)
    {
        $request->merge(['classe' => $id]);

        return $this->index($request);
    }

    public function update(Request $request, $id)
    {
        $absence = Absence::with(['eleve.classes.enseignants'])->find($id);

        if (! $absence || ! $this->canManageAbsence($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validated = $request->validate([
            'motif' => ['nullable', 'string', 'max:255'],
            'est_justifiee' => ['sometimes', 'required', 'boolean'],
        ]);

        $absence->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Absence mise à jour avec succès.',
            'data' => $absence->fresh(['eleve.classes']),
        ]);
    }

    public function updateJustification(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    public function destroy(Request $request, $id)
    {
        $absence = Absence::with(['eleve.classes.enseignants'])->find($id);

        if (! $absence || ! $this->canManageAbsence($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimée avec succès.',
        ]);
    }

    private function canManageAbsence(Request $request, Absence $absence): bool
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return true;
        }

        if ($role !== 'ENSEIGNANT') {
            return false;
        }

        return Classe::whereHas('eleves', function ($q) use ($absence) {
            $q->where('users.id', $absence->id_eleve);
        })
            ->whereHas('enseignants', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })
            ->exists();
    }
}
