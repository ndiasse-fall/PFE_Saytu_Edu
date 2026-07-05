<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use App\Services\BulletinService;
use Illuminate\Http\Request;

class EleveController extends Controller
{
    public function __construct(
        private readonly BulletinService $bulletinService
    ) {}

    public function monBulletin(Request $request)
    {
        $eleve = $request->user()->load('eleveClasses');
        $classe = $eleve->eleveClasses->first();

        return response()->json(
            $this->bulletinService->buildBulletin(
                $eleve->id,
                null,
                $classe?->id
            )
        );
    }

    public function monEmploiDuTemps(Request $request)
    {
        $eleve = $request->user();
        $classeIds = $eleve->classes()->pluck('classes.id');
        $emplois = EmploiDuTemps::with(['classe', 'enseignant', 'matiere'])
            ->whereIn('id_classe', $classeIds)
            ->where('est_publie', true)
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();
        return response()->json([
            'success' => true,
            'count' => $emplois->count(),
            'data' => $emplois,
        ]);
    }
}
