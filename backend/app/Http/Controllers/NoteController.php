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
     * Liste toutes les notes (admin ou enseignant).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $eleveId = $request->query('id_eleve');

        if ($user->isAdministrateur() || $user->isSuperAdministrateur()) {
            $query = Note::with(['eleve', 'classe', 'matiere']);
            if ($eleveId) {
                $query->where('id_eleve', $eleveId);
            }
            $notes = $query->get();
        } elseif ($user->isEnseignant()) {
            // Notes des classes affectées à l'enseignant
            $classeIds = $user->classes()->pluck('classes.id');
            $query = Note::with(['eleve', 'classe', 'matiere'])
                ->whereIn('id_classe', $classeIds);
            
            if ($eleveId) {
                $query->where('id_eleve', $eleveId);
            }
            $notes = $query->get();
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
    public function store(StoreNoteRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $classe = Classe::with(['enseignants', 'eleves'])->find($validated['id_classe']);
        if (! $classe || ! $classe->enseignants->contains($user->id)) {
            return response()->json([
                'message' => 'Accès refusé: vous n\'êtes pas affecté à cette classe.'
            ], 403);
        }

        // Vérifier que tous les élèves appartiennent à la classe
        $invalidEleves = collect($validated['notes'])->pluck('id_eleve')
            ->filter(fn($id) => ! $classe->eleves->contains($id));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => 'Certains élèves ne sont pas inscrits dans cette classe.',
                'invalid_eleve_ids' => $invalidEleves->values(),
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

        if ($user->isAdministrateur() || $user->isSuperAdministrateur()) {
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
            'data' => $note,
        ], 200);
    }

    /**
     * Suppression d'une note.
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
            'success' => true,
            'message' => 'Note supprimée avec succès.',
        ], 200);
    }
}
