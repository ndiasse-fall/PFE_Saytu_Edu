<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEDTRequest;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    /**
     * Liste tous les cours programmés.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EmploiDuTemps::with(['classe', 'enseignant', 'matiere']);

        // Filtrage selon le rôle
        if ($user->isEnseignant()) {
            $query->where('id_enseignant', $user->id);
        } elseif ($user->isEleve()) {
            $classeIds = $user->classes()->pluck('classes.id');
            $query->whereIn('id_classe', $classeIds);
        }
        // Les ADMIN et SUPER_ADMIN voient tout

        $emplois = $query->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $emplois->count(),
            'data' => $emplois
        ]);
    }

    /**
     * Ajoute un nouveau cours à l'emploi du temps.
     * 
     * @param StoreEDTRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreEDTRequest $request)
    {
        $emploi = EmploiDuTemps::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Cours ajouté avec succès.',
            'data' => $emploi->load([
                'classe',
                'enseignant',
                'matiere'
            ])
        ], 201);
    }

    /**
     * Affiche les détails d'un cours spécifique.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $query = EmploiDuTemps::with(['classe', 'enseignant', 'matiere']);

        // Filtrage selon le rôle
        if ($user->isEnseignant()) {
            $query->where('id_enseignant', $user->id);
        } elseif ($user->isEleve()) {
            $classeIds = $user->classes()->pluck('classes.id');
            $query->whereIn('id_classe', $classeIds);
        }

        $emploi = $query->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $emploi
        ]);
    }

    /**
     * Met à jour un cours existant.
     * 
     * @param StoreEDTRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(StoreEDTRequest $request, $id)
    {
        $emploi = EmploiDuTemps::findOrFail($id);
        $emploi->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cours mis à jour avec succès.',
            'data' => $emploi->load(['classe', 'enseignant', 'matiere'])
        ]);
    }

    /**
     * Supprime un cours de l'emploi du temps.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $emploi = EmploiDuTemps::findOrFail($id);
        $emploi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cours supprimé avec succès.'
        ]);
    }
}