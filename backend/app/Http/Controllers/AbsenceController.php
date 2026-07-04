<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;
use App\Models\Classe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        $query = Absence::with(['eleve.eleveClasses'])
            ->latest('date_absence')
            ->latest('id');

        if ($role === 'ELEVE') {
            $query->where('id_eleve', $user->id);
        } elseif ($role === 'ENSEIGNANT') {
            $classeIds = $user->enseignantClasses()->pluck('classes.id');
            $query->whereHas('eleve.eleveClasses', function ($builder) use ($classeIds): void {
                $builder->whereIn('classes.id', $classeIds);
            });
        }

        if ($request->filled('id_eleve') || $request->filled('eleve_id')) {
            $query->where('id_eleve', $request->integer('id_eleve') ?: $request->integer('eleve_id'));
        }

        if ($request->filled('classe')) {
            $classeId = $request->integer('classe');
            $query->whereHas('eleve.eleveClasses', function ($builder) use ($classeId): void {
                $builder->where('classes.id', $classeId);
            });
        }

        if ($request->filled('date_absence') || $request->filled('date')) {
            $query->whereDate('date_absence', $request->date('date_absence') ?? $request->date('date'));
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('date_absence', '>=', $request->date('date_debut'));
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_absence', '<=', $request->date('date_fin'));
        }

        if ($request->has('est_justifiee') && $request->input('est_justifiee') !== '') {
            $query->where('est_justifiee', $request->boolean('est_justifiee'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->whereHas('eleve', function ($builder) use ($search): void {
                $builder
                    ->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $absences = $query->get();

        return response()->json([
            'success' => true,
            'count' => $absences->count(),
            'total' => $absences->count(),
            'data' => $absences,
        ]);
    }

    public function store(StoreAbsenceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $classe = $this->resolveManagedClass($request, $validated['id_classe'] ?? null);

        if (($validated['id_classe'] ?? null) && ! $classe) {
            return response()->json([
                'message' => "Accès refusé: vous n'êtes pas affecté à cette classe.",
            ], 403);
        }

        if ($classe) {
            $invalidEleves = collect($validated['absents'])->diff($classe->eleves->pluck('id'));

            if ($invalidEleves->isNotEmpty()) {
                return response()->json([
                    'message' => 'Certains élèves ne sont pas inscrits dans cette classe.',
                    'invalid_eleve_ids' => $invalidEleves->values(),
                ], 422);
            }
        } elseif (! $this->isAdmin($request)) {
            return response()->json([
                'message' => 'La classe est obligatoire pour enregistrer des absences.',
            ], 422);
        }

        $created = [];
        $updated = [];

        foreach ($validated['absents'] as $eleveId) {
            $absence = Absence::firstOrNew([
                'date_absence' => $validated['date_absence'],
                'id_eleve' => $eleveId,
            ]);

            $absence->motif = $validated['motif'] ?? null;
            $absence->est_justifiee = $validated['est_justifiee'] ?? ($absence->exists ? $absence->est_justifiee : false);
            $absence->save();

            if ($absence->wasRecentlyCreated) {
                $created[] = $absence->fresh(['eleve.eleveClasses']);
            } else {
                $updated[] = $absence->fresh(['eleve.eleveClasses']);
            }
        }

        $data = collect([...$created, ...$updated])->values();

        return response()->json([
            'success' => true,
            'message' => 'Absences enregistrées avec succès.',
            'count' => $data->count(),
            'total' => $data->count(),
            'data' => $request->routeIs('*enregistrer') ? [
                'created' => $created,
                'updated' => $updated,
            ] : $data,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $absence = Absence::with('eleve.eleveClasses')->find($id);

        if (! $absence || ! $this->canRead($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $absence,
        ]);
    }

    public function byClasse(Request $request, int $id): JsonResponse
    {
        $request->merge(['classe' => $id]);

        return $this->index($request);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $absence = Absence::with(['eleve.eleveClasses.enseignants'])->find($id);

        if (! $absence || ! $this->canManageAbsence($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validated = $request->validate([
            'date_absence' => ['sometimes', 'required', 'date'],
            'absents' => ['sometimes', 'array', 'min:1'],
            'absents.*' => ['integer', 'exists:users,id'],
            'motif' => ['nullable', 'string', 'max:255'],
            'est_justifiee' => ['sometimes', 'required', 'boolean'],
        ]);

        $absence->update([
            'date_absence' => $validated['date_absence'] ?? $absence->date_absence,
            'id_eleve' => $validated['absents'][0] ?? $absence->id_eleve,
            'motif' => array_key_exists('motif', $validated) ? $validated['motif'] : $absence->motif,
            'est_justifiee' => array_key_exists('est_justifiee', $validated)
                ? $validated['est_justifiee']
                : $absence->est_justifiee,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absence mise à jour avec succès.',
            'data' => $absence->fresh(['eleve.eleveClasses']),
        ]);
    }

    public function updateJustification(Request $request, int $id): JsonResponse
    {
        return $this->update($request, $id);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $absence = Absence::with(['eleve.eleveClasses.enseignants'])->find($id);

        if (! $absence || ! $this->canManageAbsence($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimée avec succès.',
        ]);
    }

    private function resolveManagedClass(Request $request, int|string|null $classeId): ?Classe
    {
        if (! $classeId) {
            return null;
        }

        $classe = Classe::with(['enseignants', 'eleves'])->find($classeId);

        if (! $classe) {
            return null;
        }

        if ($this->isAdmin($request)) {
            return $classe;
        }

        $user = $request->user();

        return $classe->enseignants->contains($user->id) ? $classe : null;
    }

    private function canRead(Request $request, Absence $absence): bool
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return true;
        }

        if ($role === 'ELEVE') {
            return $absence->id_eleve === $user->id;
        }

        if ($role === 'ENSEIGNANT') {
            return $this->teacherHasStudent($user->id, $absence->id_eleve);
        }

        return false;
    }

    private function canManageAbsence(Request $request, Absence $absence): bool
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return true;
        }

        return $role === 'ENSEIGNANT' && $this->teacherHasStudent($user->id, $absence->id_eleve);
    }

    private function teacherHasStudent(int $teacherId, int $studentId): bool
    {
        return Classe::whereHas('eleves', function ($builder) use ($studentId): void {
            $builder->where('users.id', $studentId);
        })
            ->whereHas('enseignants', function ($builder) use ($teacherId): void {
                $builder->where('users.id', $teacherId);
            })
            ->exists();
    }

    private function isAdmin(Request $request): bool
    {
        return in_array($request->user()?->resolvedRole(), ['ADMIN', 'SUPER_ADMIN'], true);
    }
}
