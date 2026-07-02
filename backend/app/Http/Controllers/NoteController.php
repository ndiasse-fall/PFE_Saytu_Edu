<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Classe;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        $query = Note::with(['eleve', 'matiere', 'classe']);

        if ($role === 'ELEVE') {
            $query->where('id_eleve', $user->id);
        }

        if ($role === 'ENSEIGNANT') {
            $query->whereHas('classe.enseignants', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        if ($request->filled('id_eleve')) {
            $query->where('id_eleve', $request->id_eleve);
        }

        if ($request->filled('classe')) {
            $query->where('id_classe', $request->classe);
        }

        if ($request->filled('matiere')) {
            $query->where('id_matiere', $request->matiere);
        }

        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('eleve', function ($q2) use ($search) {
                    $q2->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                })
                    ->orWhereHas('matiere', function ($q2) use ($search) {
                        $q2->where('nom_matiere', 'like', "%{$search}%");
                    })
                    ->orWhereHas('classe', function ($q2) use ($search) {
                        $q2->where('nom_classe', 'like', "%{$search}%");
                    })
                    ->orWhere('type_evaluation', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();
        $role = $user?->resolvedRole();

        $classe = Classe::with(['enseignants', 'eleves'])
            ->find($validated['id_classe']);

        $canManageClass = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)
            || ($classe && $classe->enseignants->contains($user->id));

        if (! $classe || ! $canManageClass) {
            return response()->json([
                'message' => "Accès refusé: vous n'êtes pas affecté à cette classe.",
            ], 403);
        }

        $invalidEleves = collect($validated['notes'])
            ->pluck('id_eleve')
            ->diff($classe->eleves->pluck('id'));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => "Certains élèves ne sont pas inscrits dans cette classe.",
                'invalid_eleve_ids' => $invalidEleves->values(),
            ], 422);
        }

        $created = [];

        foreach ($validated['notes'] as $noteData) {
            $existingNote = Note::where([
                'id_eleve' => $noteData['id_eleve'],
                'id_classe' => $validated['id_classe'],
                'id_matiere' => $validated['id_matiere'],
                'type_evaluation' => $validated['type_evaluation'],
                'periode' => $validated['periode'],
            ])->first();

            if ($existingNote) {
                $existingNote->valeur = $noteData['valeur'];
                $existingNote->save();
                $created[] = $existingNote->fresh(['eleve', 'matiere', 'classe']);
                continue;
            }

            $created[] = Note::create([
                'id_eleve' => $noteData['id_eleve'],
                'id_classe' => $validated['id_classe'],
                'id_matiere' => $validated['id_matiere'],
                'type_evaluation' => $validated['type_evaluation'],
                'periode' => $validated['periode'],
                'valeur' => $noteData['valeur'],
            ])->fresh(['eleve', 'matiere', 'classe']);
        }

        return response()->json([
            'success' => true,
            'data' => $created,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $note = Note::with(['eleve', 'matiere', 'classe.enseignants'])->find($id);

        if (! $note || ! $this->canViewNote($request, $note)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $note,
        ]);
    }

    public function update(UpdateNoteRequest $request, $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note || ! $this->canManageNote($request, $note)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => $note->fresh(['eleve', 'matiere', 'classe']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note || ! $this->canManageNote($request, $note)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function resultatsParClasse(Request $request, $id)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        $classe = Classe::with(['enseignants', 'eleves'])->find($id);

        if (! $classe) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $canViewClass = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)
            || ($role === 'ENSEIGNANT' && $classe->enseignants->contains($user->id));

        if (! $canViewClass) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $query = Note::with(['eleve', 'matiere', 'classe'])
            ->where('id_classe', $id);

        if ($request->filled('matiere')) {
            $query->where('id_matiere', $request->matiere);
        }

        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }

        $notes = $query->get();

        $resultats = $classe->eleves->map(function ($eleve) use ($notes) {
            $eleveNotes = $notes->where('id_eleve', $eleve->id)->values();

            return [
                'eleve' => $eleve,
                'notes' => $eleveNotes,
                'moyenne' => round($eleveNotes->avg('valeur') ?? 0, 2),
                'total_notes' => $eleveNotes->count(),
            ];
        })->sortByDesc('moyenne')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'classe' => $classe,
                'resultats' => $resultats,
                'moyenne_classe' => round($notes->avg('valeur') ?? 0, 2),
                'total_notes' => $notes->count(),
            ],
        ]);
    }

    public function resultatsParEleve(Request $request, $id)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if ($role === 'ELEVE' && (int) $user->id !== (int) $id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $query = Note::with(['eleve', 'matiere', 'classe'])
            ->where('id_eleve', $id);

        if ($role === 'ENSEIGNANT') {
            $query->whereHas('classe.enseignants', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        }

        if ($request->filled('classe')) {
            $query->where('id_classe', $request->classe);
        }

        if ($request->filled('matiere')) {
            $query->where('id_matiere', $request->matiere);
        }

        if ($request->filled('periode')) {
            $query->where('periode', $request->periode);
        }

        $notes = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'notes' => $notes,
                'moyenne' => round($notes->avg('valeur') ?? 0, 2),
                'total_notes' => $notes->count(),
            ],
        ]);
    }

    private function canViewNote(Request $request, Note $note): bool
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return true;
        }

        if ($role === 'ELEVE') {
            return (int) $note->id_eleve === (int) $user->id;
        }

        return $role === 'ENSEIGNANT'
            && $note->classe
            && $note->classe->enseignants->contains($user->id);
    }

    private function canManageNote(Request $request, Note $note): bool
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        return in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)
            || ($role === 'ENSEIGNANT'
                && $note->classe
                && $note->classe->enseignants->contains($user->id));
    }
}
