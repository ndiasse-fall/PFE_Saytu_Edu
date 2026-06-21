<?php

namespace App\Services;

use App\Models\User;

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
}