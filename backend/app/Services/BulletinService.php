<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use Illuminate\Support\Collection;

class BulletinService
{
    public function calculerMoyenne(int $eleveId, ?string $periode = null, ?int $classeId = null): float
    {
        return $this->buildBulletin($eleveId, $periode, $classeId)['moyenne_generale'];
    }

    public function listerBulletins(?string $periode = null): Collection
    {
        $eleves = User::query()
            ->where('role', 'ELEVE')
            ->with('eleveClasses')
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get();

        return $eleves
            ->map(function (User $eleve) use ($periode): array {
                $classe = $eleve->eleveClasses->first();
                $bulletin = $this->buildBulletin($eleve->id, $periode, $classe?->id);

                return [
                    'id' => $eleve->id,
                    'eleve' => $bulletin['eleve'],
                    'classe' => $bulletin['classe']['nom'] ?? 'Sans classe',
                    'periode' => $bulletin['periode'],
                    'moyenne' => $bulletin['moyenne_generale'],
                    'rang' => $bulletin['rang'],
                    'appreciation' => $bulletin['appreciation'],
                    'absences' => $bulletin['absences']['total'],
                ];
            })
            ->sortBy([
                ['classe', 'asc'],
                ['moyenne', 'desc'],
            ])
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    public function buildBulletin(int $eleveId, ?string $periode = null, ?int $classeId = null): array
    {
        $eleve = User::query()
            ->where('role', 'ELEVE')
            ->with('eleveClasses')
            ->findOrFail($eleveId);

        $classe = $this->resolveClasse($eleve, $classeId);
        $periode = $periode ?: $this->resolvePeriode($eleve->id, $classe?->id);
        $matieres = $this->resolveMatieres($classe);

        $notes = Note::query()
            ->with('matiere')
            ->where('id_eleve', $eleve->id)
            ->when($classe, fn ($query) => $query->where('id_classe', $classe->id))
            ->when($periode, fn ($query) => $query->where('periode', $periode))
            ->get()
            ->groupBy('id_matiere');

        $totalPoints = 0;
        $totalCoef = 0;

        $lignes = $matieres->map(function (Matieres $matiere) use ($notes, &$totalPoints, &$totalCoef): array {
            $matiereNotes = $notes->get($matiere->id, collect());
            $valeurs = $matiereNotes->pluck('valeur')->map(fn ($value): float => (float) $value);
            $moyenne = $valeurs->isNotEmpty() ? round($valeurs->avg(), 2) : null;
            $coef = (int) $matiere->coefficient;

            if ($moyenne !== null) {
                $totalPoints += $moyenne * $coef;
                $totalCoef += $coef;
            }

            return [
                'id_matiere' => $matiere->id,
                'nom_matiere' => $matiere->nom_matiere,
                'coefficient' => $coef,
                'notes' => $matiereNotes->map(fn (Note $note): array => [
                    'id' => $note->id,
                    'type_evaluation' => $note->type_evaluation,
                    'periode' => $note->periode,
                    'valeur' => (float) $note->valeur,
                ])->values(),
                'devoir' => $this->firstEvaluationValue($matiereNotes, ['Devoir']),
                'composition' => $this->firstEvaluationValue($matiereNotes, ['Composition']),
                'examen' => $this->firstEvaluationValue($matiereNotes, ['Examen']),
                'moyenne' => $moyenne,
                'points' => $moyenne !== null ? round($moyenne * $coef, 2) : null,
                'appreciation' => $moyenne !== null ? $this->appreciation($moyenne) : 'Non évalué',
            ];
        })->values();

        $moyenneGenerale = $totalCoef > 0 ? round($totalPoints / $totalCoef, 2) : 0.0;
        $rang = $classe ? $this->rangDansClasse($eleve->id, $classe, $periode) : null;
        $absences = $this->absences($eleve->id, $periode);

        return [
            'etablissement' => [
                'nom' => config('app.school_name', 'Saytu Edu'),
                'annee_scolaire' => $classe?->annee_scolaire,
            ],
            'eleve' => [
                'id' => $eleve->id,
                'nom' => $eleve->nom,
                'prenom' => $eleve->prenom,
                'nom_complet' => $eleve->fullName(),
                'matricule' => $eleve->matricule_eleve,
                'date_naissance' => $eleve->date_naissance,
                'telephone_parent' => $eleve->telephone_parent,
                'adresse' => $eleve->adresse,
            ],
            'classe' => $classe ? [
                'id' => $classe->id,
                'nom' => $classe->nom_classe,
                'niveau' => $classe->niveau,
                'annee_scolaire' => $classe->annee_scolaire,
            ] : null,
            'periode' => $periode ?? 'Non définie',
            'matieres' => $lignes,
            'total_points' => round($totalPoints, 2),
            'total_coef' => $totalCoef,
            'moyenne_generale' => $moyenneGenerale,
            'rang' => $rang,
            'appreciation' => $this->appreciation($moyenneGenerale),
            'decision' => $this->decisionPassage($moyenneGenerale),
            'absences' => $absences,
        ];
    }

    private function resolveClasse(User $eleve, ?int $classeId): ?Classe
    {
        $query = $eleve->eleveClasses()->with('matieres');

        return $classeId ? $query->where('classes.id', $classeId)->first() : $query->first();
    }

    private function resolvePeriode(int $eleveId, ?int $classeId): ?string
    {
        return Note::query()
            ->where('id_eleve', $eleveId)
            ->when($classeId, fn ($query) => $query->where('id_classe', $classeId))
            ->latest('id')
            ->value('periode');
    }

    private function resolveMatieres(?Classe $classe): Collection
    {
        if ($classe) {
            $matieres = $classe->matieres()->orderBy('nom_matiere')->get();

            if ($matieres->isNotEmpty()) {
                return $matieres;
            }
        }

        return Matieres::query()->orderBy('nom_matiere')->get();
    }

    private function firstEvaluationValue(Collection $notes, array $keywords): ?float
    {
        $note = $notes->first(function (Note $note) use ($keywords): bool {
            foreach ($keywords as $keyword) {
                if (str_contains($note->type_evaluation, $keyword)) {
                    return true;
                }
            }

            return false;
        });

        return $note ? (float) $note->valeur : null;
    }

    private function rangDansClasse(int $eleveId, Classe $classe, ?string $periode): ?int
    {
        $classement = $classe->eleves()
            ->pluck('users.id')
            ->map(fn (int $id): array => [
                'id' => $id,
                'moyenne' => $this->moyennePourClasse($id, $classe, $periode),
            ])
            ->sortByDesc('moyenne')
            ->values();

        $position = $classement->search(fn (array $row): bool => $row['id'] === $eleveId);

        return $position === false ? null : $position + 1;
    }

    private function moyennePourClasse(int $eleveId, Classe $classe, ?string $periode): float
    {
        $matieres = $this->resolveMatieres($classe);
        $notes = Note::query()
            ->where('id_eleve', $eleveId)
            ->where('id_classe', $classe->id)
            ->when($periode, fn ($query) => $query->where('periode', $periode))
            ->get()
            ->groupBy('id_matiere');

        $totalPoints = 0;
        $totalCoef = 0;

        foreach ($matieres as $matiere) {
            $values = $notes->get($matiere->id, collect())->pluck('valeur');

            if ($values->isEmpty()) {
                continue;
            }

            $moyenne = round($values->avg(), 2);
            $coef = (int) $matiere->coefficient;
            $totalPoints += $moyenne * $coef;
            $totalCoef += $coef;
        }

        return $totalCoef > 0 ? round($totalPoints / $totalCoef, 2) : 0.0;
    }

    private function absences(int $eleveId, ?string $periode): array
    {
        $query = Absence::query()->where('id_eleve', $eleveId);

        $absences = $query->get();

        return [
            'total' => $absences->count(),
            'justifiees' => $absences->where('est_justifiee', true)->count(),
            'non_justifiees' => $absences->where('est_justifiee', false)->count(),
            'details' => $absences->map(fn (Absence $absence): array => [
                'date_absence' => $absence->date_absence,
                'motif' => $absence->motif,
                'est_justifiee' => (bool) $absence->est_justifiee,
            ])->values(),
            'periode' => $periode,
        ];
    }

    private function appreciation(float $moyenne): string
    {
        return match (true) {
            $moyenne >= 16 => 'Très bien',
            $moyenne >= 14 => 'Bien',
            $moyenne >= 12 => 'Assez bien',
            $moyenne >= 10 => 'Passable',
            $moyenne > 0 => 'Insuffisant',
            default => 'Non évalué',
        };
    }

    private function decisionPassage(float $moyenne): string
    {
        return $moyenne >= 10 ? 'Admis en classe supérieure' : 'Redoublement conseillé';
    }
}
