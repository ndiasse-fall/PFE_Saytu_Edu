<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEDTRequest;
use App\Models\EmploiDuTemps;

class EmploiDuTempsController extends Controller
{
    /**
     * GET /api/emplois-du-temps
     */
    public function index()
    {
        $emplois = EmploiDuTemps::with([
            'classe',
            'enseignant',
            'matiere'
        ])
        ->orderBy('jour')
        ->orderBy('heure_debut')
        ->get();

        return response()->json([
            'success' => true,
            'count' => $emplois->count(),
            'data' => $emplois
        ]);
    }

    /**
     * POST /api/emplois-du-temps
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
}