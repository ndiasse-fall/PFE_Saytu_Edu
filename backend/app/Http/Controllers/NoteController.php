<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Classe;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Liste toutes les notes (admin ou enseignant).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin() || $user->isSuperAdmin()) {
            $notes = Note::with(['eleve', 'classe', 'matiere'])->get();
        } elseif ($user->isEnseignant()) {
            // Notes des classes affectées à l'enseignant
            $classeIds = $user->classes()->pluck('classes.id');
            $notes = Note::with(['eleve', 'classe', 'matiere'])
                ->whereIn('id_classe', $classeIds)
                ->get();
        } elseif ($user->isEleve()) {
            // Notes de l'élève connecté
            $notes = Note::with(['classe', 'matiere'])
                ->where('id_eleve', $user->id)
                ->get();
        } else {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return response()->json([
            'success' => true,
            'count' => $notes->count(),
            'data' => $notes,
        ], 200);
    }

    /**
     * Création de notes par un enseignant.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $classe = Classe::find($request->id_classe);
        if (! $classe || ! $classe->enseignants->contains($user->id)) {
            return response()->json([
                'message' => 'Accès refusé: vous n\'êtes pas affecté à cette classe.'
            ], 403);
        }

        // Vérifier que tous les élèves appartiennent à la classe
        $invalidEleves = collect($request->notes)->pluck('id_eleve')
            ->filter(fn($id) => ! $classe->eleves->contains($id));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => 'Certains élèves ne sont pas inscrits dans cette classe.',
                'invalid_eleve_ids' => $invalidEleves->values(),
            ], 422);
        }

        $notes = [];
        foreach ($request->notes as $noteData) {
            $notes[] = Note::updateOrCreate(
                [
                    'id_eleve' => $noteData['id_eleve'],
                    'id_classe' => $request->id_classe,
                    'id_matiere' => $request->id_matiere,
                    'type_evaluation' => $request->type_evaluation,
                    'periode' => $request->periode,
                ],
                [
                    'valeur' => $noteData['valeur'],
                    'type_evaluation' => $request->type_evaluation,
                    'periode' => $request->periode,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'data' => $notes,
        ], 201);
    }

    /**
     * Affiche une note spécifique.
     */
    public function show(Request $request, int $id)
    {
        $note = Note::with(['eleve', 'classe', 'matiere'])->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $user = $request->user();

        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return response()->json(['success' => true, 'data' => $note], 200);
        }

        if ($user->isEnseignant() && $note->classe->enseignants->contains($user->id)) {
            return response()->json(['success' => true, 'data' => $note], 200);
        }

        if ($user->isEleve() && $note->id_eleve === $user->id) {
            return response()->json(['success' => true, 'data' => $note], 200);
        }

        return response()->json(['message' => 'Not Found'], 404);
    }

    /**
     * Mise à jour d'une note.
     */
    public function update(Request $request, int $id)
    {
        $note = Note::find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->update($request->only(['valeur', 'type_evaluation', 'periode']));

        return response()->json([
            'success' => true,
            'data' => $note,
        ], 200);
    }

    /**
     * Suppression d'une note.
     */
    public function destroy(int $id)
    {
        $note = Note::find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note supprimée avec succès.',
        ], 200);
    }
}
