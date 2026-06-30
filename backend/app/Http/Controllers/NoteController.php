<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Classe;
use Illuminate\Http\Request;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;

class NoteController extends Controller
{
    /**
     * =====================================================
     * LISTE DES NOTES
     * =====================================================
     */
    public function index(Request $request)
{
    $user = $request->user();
    $role = $user?->resolvedRole();

    $query = Note::with(['eleve', 'matiere', 'classe']);

    /* ================= ELEVE ================= */
    if ($role === 'ELEVE') {
        $query->where('id_eleve', $user->id);
    }

    /* ================= ENSEIGNANT ================= */
    if ($role === 'ENSEIGNANT') {
        $query->whereHas('classe.enseignants', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        });
    }

    /* ================= FILTRES ================= */

    if ($request->filled('classe')) {
        $query->where('id_classe', $request->classe);
    }

    if ($request->filled('matiere')) {
        $query->where('id_matiere', $request->matiere);
    }

    if ($request->filled('periode')) {
        $query->where('periode', $request->periode);
    }

    /* ================= SEARCH ================= */

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
        'data' => $query->get()
    ]);
}

    /**
     * =====================================================
     * AJOUTER DES NOTES (BULK)
     * =====================================================
     */
    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();
        $role = $user?->resolvedRole();

        $classe = Classe::with(['enseignants', 'eleves'])
            ->find($validated['id_classe']);

        $canManageClass = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true) || ($classe && $classe->enseignants->contains($user->id));

        if (! $classe || ! $canManageClass) {
            return response()->json([
                'message' => "Accès refusé: vous n'êtes pas affecté à cette classe."
            ], 403);
        }

        // Vérifier élèves appartenant à la classe
        $invalidEleves = collect($validated['notes'])
            ->pluck('id_eleve')
            ->diff($classe->eleves->pluck('id'));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => "Certains élèves ne sont pas inscrits dans cette classe.",
                'invalid_eleve_ids' => $invalidEleves->values()
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
                $created[] = $existingNote;
                continue;
            }

            $created[] = Note::create([
                'id_eleve' => $noteData['id_eleve'],
                'id_classe' => $validated['id_classe'],
                'id_matiere' => $validated['id_matiere'],
                'type_evaluation' => $validated['type_evaluation'],
                'periode' => $validated['periode'],
                'valeur' => $noteData['valeur'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $created
        ], 201);
    }

    /**
     * =====================================================
     * DÉTAIL NOTE
     * =====================================================
     */
    public function show(Request $request, $id)
    {
        $note = Note::with(['eleve', 'matiere', 'classe'])->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $user = $request->user();

        // ELEVE ne voit que ses propres notes
        if ($user->role === 'ELEVE' && $note->id_eleve !== $user->id) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $note
        ]);
    }

    /**
     * =====================================================
     * MODIFIER NOTE
     * =====================================================
     */
    public function update(Request $request, $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $user = $request->user();
        $role = $user?->resolvedRole();

        $canManageNote = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true) || ($note->classe && $note->classe->enseignants->contains($user->id));

        if (! $note->classe || ! $canManageNote) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validated = $request->validate([
            'valeur' => 'required|numeric|min:0|max:20'
        ]);

        $note->update($validated);

        return response()->json([
            'success' => true,
            'data' => $note
        ]);
    }

    /**
     * =====================================================
     * SUPPRIMER NOTE
     * =====================================================
     */
    public function destroy(Request $request, $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $user = $request->user();
        $role = $user?->resolvedRole();

        $canManageNote = in_array($role, ['ADMIN', 'SUPER_ADMIN'], true) || ($note->classe && $note->classe->enseignants->contains($user->id));

        if (! $note->classe || ! $canManageNote) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true
        ]);
    }

   

 
}