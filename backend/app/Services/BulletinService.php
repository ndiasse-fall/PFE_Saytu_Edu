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
            if (!$note->matiere) {
                continue;
            }
            $coef = $note->matiere->coefficient;
            $totalPoints += $note->valeur * $coef;
            $totalCoef += $coef;
        }

        return $totalCoef > 0
            ? round($totalPoints / $totalCoef, 2)
            : 0;
    }

    public function listerBulletins(?string $periode = null): Collection
    {
        $eleves = User::where('statut', 'ELEVE')
            ->with(['notes' => function ($q) use ($periode) {
                $q->with('matiere');
                if ($periode) {
                    $q->where('periode', $periode);
                }
            }])
            ->get();

        return $eleves->map(function (User $eleve) use ($periode) {
            $totalPoints = 0;
            $totalCoef = 0;

            foreach ($eleve->notes as $note) {
                if (!$note->matiere) {
                    continue;
                }
                $coef = $note->matiere->coefficient;
                $totalPoints += $note->valeur * $coef;
                $totalCoef += $coef;
            }

            $moyenne = $totalCoef > 0
                ? round($totalPoints / $totalCoef, 2)
                : 0;

            return [
                'id'      => $eleve->id,
                'eleve'   => [
                    'id'  => $eleve->id,
                    'nom' => $eleve->name ?? trim(($eleve->prenom ?? '') . ' ' . ($eleve->nom ?? '')),
                ],
                'periode' => $periode ?? 'Toutes périodes',
                'moyenne' => $moyenne,
            ];
        });
    }
}
