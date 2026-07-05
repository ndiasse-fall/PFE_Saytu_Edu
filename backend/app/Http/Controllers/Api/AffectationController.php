<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Matieres;
use App\Models\User;
use Illuminate\Http\Request;

class AffectationController extends Controller
{
    /**
     * Liste toutes les affectations.
     */
    public function index()
    {
        $classeMatieres = Classe::with('matieres')->get()->flatMap(function ($classe) {
            return $classe->matieres->map(function ($matiere) use ($classe) {
                return [
                    // On garde cet ID composite unique pour le frontend (React key et suppression)
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
                    // On garde cet ID composite unique pour le frontend
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
     * Supprimer une affectation en interceptant la chaîne composite (ex: em-11-4 ou cm-2-5).
     */
    public function destroy($compositeId)
    {
        // On découpe la chaîne reçue (ex: "em-11-4" devient ['em', '11', '4'])
        $parts = explode('-', $compositeId);

        if (count($parts) !== 3) {
            return response()->json(['message' => 'Format d\'identifiant invalide.'], 400);
        }

        $typePrefix = $parts[0]; // 'cm' ou 'em'
        $id1 = $parts[1];        // ID de la Classe ou de l'Enseignant
        $id2 = $parts[2];        // ID de la Matière

        // Cas 1 : Matière affectée à une Classe (cm)
        if ($typePrefix === 'cm') {
            $classe = Classe::findOrFail($id1);
            $classe->matieres()->detach($id2);

            return response()->json([
                'message' => 'L\'affectation matière-classe a été supprimée avec succès.'
            ]);
        }

        // Cas 2 : Enseignant affecté à une Matière (em)
        if ($typePrefix === 'em') {
            $enseignant = User::findOrFail($id1);
            $enseignant->matieres()->detach($id2);

            return response()->json([
                'message' => 'L\'affectation enseignant-matière a été supprimée avec succès.'
            ]);
        }

        return response()->json([
            'message' => 'Type d\'affectation inconnu.'
        ], 404);
    }

    /**
     * Affecter une matière à une classe.
     */
    public function affecterMatiereClasse(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $classe = Classe::findOrFail($request->classe_id);
        
        // syncWithoutDetaching évite les doublons sans écraser le reste
        $classe->matieres()->syncWithoutDetaching([$request->matiere_id]);

        return response()->json([
            'success' => true,
            'message' => 'Matière affectée à la classe avec succès.'
        ]);
    }

    /**
     * Affecter un enseignant à une matière.
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

        $matiere = Matieres::findOrFail($request->matiere_id);

        if ($user->specialite !== $matiere->nom_matiere) {
            return response()->json([
                'success' => false,
                'message' => 'La spécialité de l\'enseignant doit être égale à la matière affectée.'
            ], 422);
        }

        $user->matieres()->syncWithoutDetaching([$request->matiere_id]);

        return response()->json([
            'success' => true,
            'message' => 'Enseignant été affecté à la matière avec succès.'
        ]);
    }
}