<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\User;
use Illuminate\Http\Request;

class AffectationController extends Controller
{
    /**
     * Liste toutes les affectations.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $classeMatieres = Classe::with('matieres')->get()->flatMap(function ($classe) {
            return $classe->matieres->map(function ($matiere) use ($classe) {
                return [
                    'id' => "cm-{$classe->id}-{$matiere->id}",
                    'target_name' => $classe->nom_classe,
                    'matiere_nom' => $matiere->nom_matiere,
                    'type' => 'Matière à Classe'
                ];
            });
        });

        $enseignantMatieres = User::byRole('ENSEIGNANT')->with('matieres')->get()->flatMap(function ($user) {
            return $user->matieres->map(function ($matiere) use ($user) {
                return [
                    'id' => "em-{$user->id}-{$matiere->id}",
                    'target_name' => "{$user->prenom} {$user->nom}",
                    'matiere_nom' => $matiere->nom_matiere,
                    'type' => 'Enseignant à Matière'
                ];
            });
        });

        return response()->json(
            $classeMatieres->concat($enseignantMatieres)->values()
        );
    }

    /**
     * Affecter une matière à une classe.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function affecterMatiereClasse(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $classe = Classe::findOrFail($request->classe_id);
        
        // On suppose que la relation est définie dans le modèle Classe
        // Sinon on peut utiliser DB::table('classe_matiere')->insertOrIgnore(...)
        $classe->matieres()->syncWithoutDetaching([$request->matiere_id]);

        return response()->json([
            'success' => true,
            'message' => 'Matière affectée à la classe avec succès.'
        ]);
    }

    /**
     * Affecter un enseignant à une matière.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function affecterEnseignantMatiere(Request $request)
    {
        $request->validate([
            'enseignant_id' => 'required|exists:users,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $user = User::findOrFail($request->enseignant_id);
        
        if (!$user->isEnseignant()) {
            return response()->json([
                'success' => false,
                'message' => 'L\'utilisateur sélectionné n\'est pas un enseignant.'
            ], 422);
        }

        $user->matieres()->syncWithoutDetaching([$request->matiere_id]);

        return response()->json([
            'success' => true,
            'message' => 'Enseignant affecté à la matière avec succès.'
        ]);
    }
}
