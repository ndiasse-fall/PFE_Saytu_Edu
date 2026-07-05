<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicDataSeeder extends Seeder
{
    public function run(): void
    {
        $classes = Classe::query()->with(['eleves', 'matieres'])->orderBy('id')->get();

        foreach ($classes as $classe) {
            $this->seedNotesForClass($classe);
            $this->seedAbsencesForClass($classe);
        }
    }

    private function seedNotesForClass(Classe $classe): void
    {
        $scale = $this->noteScaleForClasse($classe);
        $students = $classe->eleves()->orderBy('nom')->orderBy('prenom')->get();
        $matieres = $classe->matieres()->orderBy('nom_matiere')->get();

        foreach ($students as $studentIndex => $eleve) {
            foreach ($matieres as $matiereIndex => $matiere) {
                foreach ([
                    'Semestre 1' => ['Devoir 1', 'Composition'],
                    'Semestre 2' => ['Devoir 1', 'Composition'],
                ] as $periode => $evaluations) {
                    foreach ($evaluations as $evaluationIndex => $typeEvaluation) {
                        $value = $this->generateNoteValue(
                            $scale,
                            $classe->niveau,
                            $studentIndex,
                            $matiereIndex,
                            $evaluationIndex,
                            $periode
                        );

                        Note::query()->updateOrCreate(
                            [
                                'id_eleve' => $eleve->id,
                                'id_classe' => $classe->id,
                                'id_matiere' => $matiere->id,
                                'type_evaluation' => $typeEvaluation,
                                'periode' => $periode,
                            ],
                            [
                                'valeur' => $value,
                            ]
                        );
                    }
                }
            }
        }
    }

    private function seedAbsencesForClass(Classe $classe): void
    {
        $students = $classe->eleves()->orderBy('nom')->orderBy('prenom')->get();

        foreach ($students as $index => $eleve) {
            if ($index % 4 !== 0) {
                continue;
            }

            Absence::query()->updateOrCreate(
                [
                    'id_eleve' => $eleve->id,
                    'date_absence' => now()->subDays(7 + $index)->format('Y-m-d'),
                ],
                [
                    'motif' => $index % 2 === 0
                        ? 'Maladie signalée par le parent'
                        : 'Absence non justifiée',
                    'est_justifiee' => $index % 2 === 0,
                ]
            );
        }
    }

    private function noteScaleForClasse(Classe $classe): int
    {
        return $classe->niveau === 'Primaire' ? 10 : 20;
    }

    private function generateNoteValue(
        int $scale,
        string $niveau,
        int $studentIndex,
        int $matiereIndex,
        int $evaluationIndex,
        string $periode
    ): float {
        $base = $scale === 10 ? 5 : 10;
        $variance = ($studentIndex + $matiereIndex + $evaluationIndex + ($periode === 'Semestre 2' ? 2 : 0)) % ($scale === 10 ? 6 : 11);
        $raw = min($scale, $base + $variance);

        if ($niveau === 'Préscolaire') {
            return round(min(10, 6 + $variance * 0.5), 2);
        }

        return round($raw, 2);
    }
}
