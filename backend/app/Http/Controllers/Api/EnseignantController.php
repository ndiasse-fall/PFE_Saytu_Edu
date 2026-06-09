<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Models\Classe;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EnseignantController extends Controller
{
    /**
     * Permet à un enseignant (ou admin) de saisir les notes pour une classe et une matière.
     * 
     * @param StoreNoteRequest $request
     * @return JsonResponse
     */
    public function saisirNotes(StoreNoteRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $enseignant = $request->user();

        $classe = Classe::query()->findOrFail($validated['id_classe']);

        // Vérification que l'enseignant est bien affecté à cette classe
        if (
            $enseignant->resolvedRole() === 'ENSEIGNANT'
            && ! $classe->enseignants()->whereKey($enseignant->id)->exists()
        ) {
            return response()->json([
                'message' => 'Accès refusé: vous n\'êtes pas affecté à cette classe.',
            ], 403);
        }

        // Vérification que tous les élèves saisis sont bien dans la classe
        $elevesDansLaClasse = $classe->eleves()->pluck('users.id')->all();
        $idsElevesSaisis = collect($validated['notes'])
            ->pluck('id_eleve')
            ->unique()
            ->values()
            ->all();

        $idsInvalides = collect($idsElevesSaisis)
            ->reject(fn (int $idEleve): bool => in_array($idEleve, $elevesDansLaClasse, true))
            ->values()
            ->all();

        if ($idsInvalides !== []) {
            return response()->json([
                'message' => 'Certains élèves ne sont pas inscrits dans cette classe.',
                'invalid_eleve_ids' => $idsInvalides,
            ], 422);
        }

        // Enregistrement des notes en base de données
        $savedNotes = DB::transaction(function () use ($validated) {
            return collect($validated['notes'])->map(function (array $noteData) use ($validated) {
                return Note::query()->updateOrCreate(
                    [
                        'id_classe' => $validated['id_classe'],
                        'id_matiere' => $validated['id_matiere'],
                        'id_eleve' => $noteData['id_eleve'],
                        'type_evaluation' => $validated['type_evaluation'],
                        'periode' => $validated['periode'],
                    ],
                    [
                        'valeur' => $noteData['valeur'],
                    ],
                );
            });
        });

        // Récupération des notes avec relations pour la réponse
        $notes = Note::query()
            ->with(['eleve:id,nom,prenom,email', 'matiere:id,nom_matiere', 'classe:id,nom_classe,niveau'])
            ->whereIn('id', $savedNotes->pluck('id'))
            ->orderBy('id')
            ->get();

        return response()->json([
            'message' => 'Notes enregistrées avec succès.',
            'data' => $notes,
        ], 201);
    }
}