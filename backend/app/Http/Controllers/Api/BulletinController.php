<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\BulletinService;
use App\Models\User;
use App\Models\Matieres;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulletinController extends Controller
{
    public function __construct(
        private readonly BulletinService $bulletinService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $periode = $request->query('periode');
        $bulletins = $this->bulletinService->listerBulletins($periode);
        return response()->json($bulletins);
    }

    public function show(int $id): JsonResponse
    {
        $eleve = User::findOrFail($id);
        $eleve->load('classes');
        $classe = $eleve->classes->first();

        $notes = $eleve->notes()->with('matiere')->get();
        $toutesLesMatieres = Matieres::all();

        // Regrouper les notes par matière
        $notesParMatiere = [];
        foreach ($notes as $note) {
            if (!$note->matiere) continue;
            $mid = $note->id_matiere;
            if (!isset($notesParMatiere[$mid])) {
                $notesParMatiere[$mid] = ['devoir' => null, 'examen' => null];
            }
            if ($note->type_evaluation === 'Devoir') $notesParMatiere[$mid]['devoir'] = $note->valeur;
            if ($note->type_evaluation === 'Examen') $notesParMatiere[$mid]['examen'] = $note->valeur;
        }

        // Construire le tableau avec toutes les matières
        $matieres = [];
        $totalPoints = 0;
        $totalCoef = 0;
        foreach ($toutesLesMatieres as $matiere) {
            $mid = $matiere->id;
            $devoir = $notesParMatiere[$mid]['devoir'] ?? null;
            $examen = $notesParMatiere[$mid]['examen'] ?? null;
            $valeurs = array_filter([$devoir, $examen], fn($v) => $v !== null);
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
            'matieres'         => $matieres,
            'periode'          => $notes->first()?->periode ?? '-',
        ]);
    }
}