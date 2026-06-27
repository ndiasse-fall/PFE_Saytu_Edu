<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;
use App\Services\BulletinService;

class EleveController extends Controller
{
    public function __construct(
        private readonly BulletinService $bulletinService
    ) {}

    public function monBulletin(Request $request)
    {
        $eleve = $request->user();

        return response()->json([
            'eleve' => $eleve->name,
            'moyenne_generale' => $this->bulletinService
                ->calculerMoyenne($eleve->id),
            'notes' => $eleve->notes()
                ->with('matiere')
                ->get()
        ]);
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
