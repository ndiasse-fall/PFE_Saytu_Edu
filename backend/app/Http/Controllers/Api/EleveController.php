<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;
use App\Services\BulletinService;
use App\Models\Matieres;

class EleveController extends Controller
{
    public function __construct(
        private readonly BulletinService $bulletinService
    ) {}

    public function monBulletin(Request $request)
    {
        $eleve = $request->user()->load('classes');
        $classe = $eleve->classes->first();

        $notes = $eleve->notes()->with('matiere')->get();
        $toutesLesMatieres = Matieres::all();

        // Regrouper toutes les notes par matière, en gardant les clés historiques devoir/examen.
        $notesParMatiere = [];
        foreach ($notes as $note) {
            if (!$note->matiere) continue;
            $id = $note->id_matiere;
            if (!isset($notesParMatiere[$id])) {
                $notesParMatiere[$id] = ['devoir' => null, 'examen' => null, 'valeurs' => []];
            }
            if (str_contains($note->type_evaluation, 'Devoir') || str_contains($note->type_evaluation, 'Composition')) {
                $notesParMatiere[$id]['devoir'] = $note->valeur;
            }
            if (str_contains($note->type_evaluation, 'Examen')) {
                $notesParMatiere[$id]['examen'] = $note->valeur;
            }
            $notesParMatiere[$id]['valeurs'][] = $note->valeur;
        }

        // Construire le tableau avec toutes les matières
        $matieres = [];
        $totalPoints = 0;
        $totalCoef = 0;
        foreach ($toutesLesMatieres as $matiere) {
            $id = $matiere->id;
            $devoir = $notesParMatiere[$id]['devoir'] ?? null;
            $examen = $notesParMatiere[$id]['examen'] ?? null;
            $valeurs = $notesParMatiere[$id]['valeurs'] ?? [];
            $moyenne = count($valeurs) > 0 ? round(array_sum($valeurs) / count($valeurs), 2) : null;

            if ($moyenne !== null) {
                $totalPoints += $moyenne * $matiere->coefficient;
                $totalCoef   += $matiere->coefficient;
            }

            $matieres[] = [
                'nom_matiere' => $matiere->nom_matiere,
                'coefficient' => $matiere->coefficient,
                'devoir'      => $devoir,
                'examen'      => $examen,
                'moyenne'     => $moyenne,
            ];
        }

        $moyenne = $totalCoef > 0 ? round($totalPoints / $totalCoef, 2) : 0;

        return response()->json([
            'eleve' => [
                'nom'            => $eleve->nom,
                'prenom'         => $eleve->prenom,
                'matricule'      => $eleve->matricule_eleve,
                'date_naissance' => $eleve->date_naissance,
            ],
            'classe' => $classe ? [
                'nom'            => $classe->nom_classe,
                'niveau'         => $classe->niveau,
                'annee_scolaire' => $classe->annee_scolaire,
            ] : null,
            'moyenne_generale' => $moyenne,
            'total_coef'       => $totalCoef,
            'notes'            => $notes->values(),
            'matieres'         => $matieres,
            'notes'            => $matieres,
            'periode'          => $notes->first()?->periode ?? '-',
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
