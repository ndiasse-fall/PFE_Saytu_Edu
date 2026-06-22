<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\Classe;
use Illuminate\Http\Request;

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

        $query = Note::with(['eleve', 'matiere', 'classe']);

        // ELEVE → seulement ses notes
        if ($user->role === 'ELEVE') {
            $query->where('id_eleve', $user->id);
        }

        // ENSEIGNANT → seulement ses classes
        if ($user->role === 'ENSEIGNANT') {
            $query->whereHas('classe.enseignants', function ($q) use ($user) {
                $q->where('users.id', $user->id);
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
        $validated = $request->validated();

        $classe = Classe::with(['enseignants', 'eleves'])->find($validated['id_classe']);
        if (! $classe || ! $classe->enseignants->contains($user->id)) {
            return response()->json([
                'message' => "Accès refusé: vous n'êtes pas affecté à cette classe."
            ], 403);
        }

        // Vérifier que tous les élèves appartiennent à la classe
        $invalidEleves = collect($validated['notes'])->pluck('id_eleve')
            ->filter(fn($id) => ! $classe->eleves->contains($id));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => "Certains élèves ne sont pas inscrits dans cette classe.",
                'invalid_eleve_ids' => $invalidEleves->values()
            ], 422);
        }

        $notes = [];
        foreach ($validated['notes'] as $noteData) {
            $notes[] = Note::updateOrCreate(
                [
                    'id_eleve' => $noteData['id_eleve'],
                    'id_classe' => $validated['id_classe'],
                    'id_matiere' => $validated['id_matiere'],
                    'type_evaluation' => $validated['type_evaluation'],
                    'periode' => $validated['periode'],
                ],
                [
                    'valeur' => $noteData['valeur'],
                    'type_evaluation' => $validated['type_evaluation'],
                    'periode' => $validated['periode'],
                ]
            );
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
    public function update(UpdateNoteRequest $request, int $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        if (! $note->classe || ! $note->classe->enseignants->contains($request->user()->id)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->update($request->validated());

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
    public function destroy(Request $request, int $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        if (! $note->classe || ! $note->classe->enseignants->contains($request->user()->id)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true
        ]);
    }

    /**
     * =====================================================
     * RESULTATS CLASSE
     * =====================================================
     */
    public function resultatsParClasse($id)
    {
        $notes = Note::with(['eleve', 'matiere', 'classe'])
            ->where('id_classe', $id)
            ->get();

        return response()->json([
            'success' => true,
            'count' => $notes->count(),
            'data' => $notes
        ]);
    }

    /**
     * =====================================================
     * RESULTATS ELEVE
     * =====================================================
     */
    public function resultatsParEleve($id)
    {
        $notes = Note::with(['eleve', 'matiere', 'classe'])
            ->where('id_eleve', $id)
            ->get();

        return response()->json([
            'success' => true,
            'count' => $notes->count(),
            'data' => $notes
        ]);
    }
}