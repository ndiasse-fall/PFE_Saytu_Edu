<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\EmploiDuTemps;
use App\Models\Matieres;
use App\Models\User;
use Illuminate\Database\Seeder;

class EmploiDuTempsSeeder extends Seeder
{
    public function run(): void
    {
        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        $creneaux = [
            ['08:00:00', '10:00:00'],
            ['10:00:00', '12:00:00'],
            ['14:00:00', '16:00:00'],
            ['16:00:00', '18:00:00'],
        ];

        $teacherBusy = [];
        $roomBusy = [];
        $classes = Classe::query()->with('matieres')->orderBy('id')->get();
        $teachersBySubject = User::query()
            ->where('role', 'ENSEIGNANT')
            ->with('matieres')
            ->get()
            ->flatMap(function (User $teacher) {
                return $teacher->matieres->map(fn (Matieres $matiere): array => [
                    'matiere' => $matiere->nom_matiere,
                    'teacher' => $teacher,
                ]);
            })
            ->groupBy('matiere')
            ->map(fn ($rows) => $rows->pluck('teacher'));

        foreach ($classes as $classIndex => $classe) {
            $room = 'Salle ' . str_pad((string) ($classIndex + 1), 2, '0', STR_PAD_LEFT);
            $matieres = $classe->matieres->take(8)->values();

            foreach ($matieres as $matiereIndex => $matiere) {
                $slotIndex = $matiereIndex % count($creneaux);
                $dayIndex = intdiv($matiereIndex, count($creneaux)) % count($jours);
                $enseignant = $this->availableTeacher(
                    $teachersBySubject[$matiere->nom_matiere] ?? collect(),
                    $jours,
                    $creneaux,
                    $teacherBusy,
                    $roomBusy,
                    $dayIndex,
                    $slotIndex,
                    $room
                );

                if (! $enseignant) {
                    continue;
                }

                [$heureDebut, $heureFin] = $creneaux[$slotIndex];
                $jour = $jours[$dayIndex];
                $busyKey = "{$jour}|{$heureDebut}|{$heureFin}";
                $teacherBusy[$enseignant->id][$busyKey] = true;
                $roomBusy[$room][$busyKey] = true;

                EmploiDuTemps::query()->updateOrCreate(
                    [
                        'jour' => $jour,
                        'heure_debut' => $heureDebut,
                        'heure_fin' => $heureFin,
                        'id_classe' => $classe->id,
                    ],
                    [
                        'salle' => $room,
                        'id_enseignant' => $enseignant->id,
                        'id_matiere' => $matiere->id,
                        'est_publie' => true,
                    ]
                );
            }
        }
    }

    private function availableTeacher($teachers, array &$jours, array &$creneaux, array $teacherBusy, array $roomBusy, int &$dayIndex, int &$slotIndex, string $room): ?User
    {
        for ($attempt = 0; $attempt < count($jours) * count($creneaux); $attempt++) {
            [$heureDebut, $heureFin] = $creneaux[$slotIndex];
            $jour = $jours[$dayIndex];
            $busyKey = "{$jour}|{$heureDebut}|{$heureFin}";

            if (! isset($roomBusy[$room][$busyKey])) {
                foreach ($teachers as $teacher) {
                    if (! isset($teacherBusy[$teacher->id][$busyKey])) {
                        return $teacher;
                    }
                }
            }

            $slotIndex = ($slotIndex + 1) % count($creneaux);
            if ($slotIndex === 0) {
                $dayIndex = ($dayIndex + 1) % count($jours);
            }
        }

        return null;
    }
}
