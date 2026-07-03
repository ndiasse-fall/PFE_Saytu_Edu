<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class BulletinService
{
    public function calculerMoyenne(int $eleveId)
    {
        $eleve = User::with('notes.matiere')->findOrFail($eleveId);
        $totalPoints = 0;
        $totalCoef = 0;
        foreach ($eleve->notes as $note) {
            if (!$note->matiere) continue;
            $coef = $note->matiere->coefficient;
            $totalPoints += $note->valeur * $coef;
            $totalCoef += $coef;
        }
        return $totalCoef > 0 ? round($totalPoints / $totalCoef, 2) : 0;
    }

    public function listerBulletins(?string $periode = null): Collection
    {
        $eleves = User::where('statut', 'ELEVE')
            ->with(['notes' => function ($q) use ($periode) {
                $q->with('matiere');
                if ($periode) {
                    $q->where('periode', $periode);
                }
            }, 'classes'])
            ->get();

        $bulletins = $eleves->map(function (User $eleve) use ($periode) {
            $totalPoints = 0;
            $totalCoef = 0;
            foreach ($eleve->notes as $note) {
                if (!$note->matiere) continue;
                $coef = $note->matiere->coefficient;
                $totalPoints += $note->valeur * $coef;
                $totalCoef += $coef;
            }
            $moyenne = $totalCoef > 0 ? round($totalPoints / $totalCoef, 2) : 0;
            $classe = $eleve->classes->first();

            // Extraire la vraie période depuis les notes de l'élève
            $elevesPeriode = $periode;
            if (!$elevesPeriode && $eleve->notes->isNotEmpty()) {
                $elevesPeriode = $eleve->notes->first()->periode;
            }

            return [
                'id'      => $eleve->id,
                'eleve'   => [
                    'id'  => $eleve->id,
                    'nom' => trim(($eleve->prenom ?? '') . ' ' . ($eleve->nom ?? '')),
                ],
                'classe'  => $classe ? $classe->nom_classe : 'Sans classe',
                'periode' => $elevesPeriode ?? 'Non définie',
                'moyenne' => $moyenne,
            ];
        });

        // Trier par classe puis par moyenne décroissante
        return $bulletins
            ->sortBy('classe')
            ->groupBy('classe')
            ->map(fn($groupe) => $groupe->sortByDesc('moyenne'))
            ->flatten(1)
            ->values();
    }
}