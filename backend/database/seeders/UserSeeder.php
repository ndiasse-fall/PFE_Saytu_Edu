<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $superAdmin = $this->upsertUserByEmail([
            'email' => 'superadmin@saytu.edu',
            'nom' => 'Sow',
            'prenom' => 'Abdou',
            'password' => $password,
            'telephone' => '770000000',
            'adresse' => 'Dakar Plateau',
            'role' => RoleEnum::SUPER_ADMIN->value,
            'statut' => RoleEnum::SUPER_ADMIN->value,
            'actif' => true,
            'must_change_password' => false,
        ]);

        $admins = [
            ['prenom' => 'Aminata', 'nom' => 'Diouf', 'email' => 'aminata.diouf@saytu.edu', 'telephone' => '771234501', 'adresse' => 'Mermoz, Dakar'],
            ['prenom' => 'Mamadou', 'nom' => 'Ndiaye', 'email' => 'mamadou.ndiaye@saytu.edu', 'telephone' => '771234502', 'adresse' => 'Thiès Escale'],
            ['prenom' => 'Rokhaya', 'nom' => 'Sarr', 'email' => 'rokhaya.sarr@saytu.edu', 'telephone' => '771234503', 'adresse' => 'Saint-Louis Sor'],
        ];

        foreach ($admins as $admin) {
            $this->upsertUserByEmail([
                ...$admin,
                'password' => $password,
                'role' => RoleEnum::ADMIN->value,
                'statut' => RoleEnum::ADMIN->value,
                'id_parent_createur' => $superAdmin->id,
                'actif' => true,
                'must_change_password' => false,
            ]);
        }

        $enseignants = $this->seedEnseignants($password, $superAdmin->id);
        $eleves = $this->seedEleves($password, $superAdmin->id);

        $this->attachTeachersToSubjectsAndClasses($enseignants);
        $this->attachStudentsToClassesAndCreateAcademicData($eleves);
    }

    /**
     * @return array<int, User>
     */
    private function seedEnseignants(string $password, int $creatorId): array
    {
        $enseignants = [
            ['prenom' => 'Cheikh', 'nom' => 'Faye', 'email' => 'cheikh.faye@saytu.edu', 'telephone' => '772010101', 'adresse' => 'Parcelles Assainies, Dakar', 'specialite' => 'Mathématiques'],
            ['prenom' => 'Fatou', 'nom' => 'Fall', 'email' => 'fatou.fall@saytu.edu', 'telephone' => '772010102', 'adresse' => 'Guédiawaye', 'specialite' => 'Français'],
            ['prenom' => 'Ibrahima', 'nom' => 'Sy', 'email' => 'ibrahima.sy@saytu.edu', 'telephone' => '772010103', 'adresse' => 'Rufisque', 'specialite' => 'Histoire-Géographie'],
            ['prenom' => 'Aïssatou', 'nom' => 'Diop', 'email' => 'aissatou.diop@saytu.edu', 'telephone' => '772010104', 'adresse' => 'Pikine', 'specialite' => 'SVT'],
            ['prenom' => 'Ousmane', 'nom' => 'Seck', 'email' => 'ousmane.seck@saytu.edu', 'telephone' => '772010105', 'adresse' => 'Kaolack', 'specialite' => 'Physique-Chimie'],
            ['prenom' => 'Mariama', 'nom' => 'Ba', 'email' => 'mariama.ba@saytu.edu', 'telephone' => '772010106', 'adresse' => 'Ziguinchor', 'specialite' => 'Anglais'],
            ['prenom' => 'Khadim', 'nom' => 'Sarr', 'email' => 'khadim.sarr@saytu.edu', 'telephone' => '772010107', 'adresse' => 'Touba', 'specialite' => 'Informatique'],
            ['prenom' => 'Astou', 'nom' => 'Sow', 'email' => 'astou.sow@saytu.edu', 'telephone' => '772010108', 'adresse' => 'Louga', 'specialite' => 'EPS'],
            ['prenom' => 'Mame Diarra', 'nom' => 'Ndiaye', 'email' => 'mame.diarra.ndiaye@saytu.edu', 'telephone' => '772010109', 'adresse' => 'Diourbel', 'specialite' => 'Lecture'],
            ['prenom' => 'Moussa', 'nom' => 'Gueye', 'email' => 'moussa.gueye@saytu.edu', 'telephone' => '772010110', 'adresse' => 'Tambacounda', 'specialite' => 'Philosophie'],
            ['prenom' => 'Ndeye Coumba', 'nom' => 'Thiam', 'email' => 'ndeye.thiam@saytu.edu', 'telephone' => '772010111', 'adresse' => 'Kolda', 'specialite' => 'Écriture'],
            ['prenom' => 'Serigne', 'nom' => 'Mbaye', 'email' => 'serigne.mbaye@saytu.edu', 'telephone' => '772010112', 'adresse' => 'Mbour', 'specialite' => 'Éducation civique'],
            ['prenom' => 'Adama', 'nom' => 'Kane', 'email' => 'adama.kane@saytu.edu', 'telephone' => '772010113', 'adresse' => 'Matam', 'specialite' => 'Langage'],
            ['prenom' => 'Awa', 'nom' => 'Cissé', 'email' => 'awa.cisse@saytu.edu', 'telephone' => '772010114', 'adresse' => 'Dakar Liberté 6', 'specialite' => 'Économie'],
        ];

        return array_map(fn (array $enseignant): User => $this->upsertUserByEmail([
            ...$enseignant,
            'password' => $password,
            'role' => RoleEnum::ENSEIGNANT->value,
            'statut' => RoleEnum::ENSEIGNANT->value,
            'date_embauche' => '2021-10-01',
            'id_parent_createur' => $creatorId,
            'actif' => true,
            'must_change_password' => false,
        ]), $enseignants);
    }

    /**
     * @return array<int, array{user: User, classe: string}>
     */
    private function seedEleves(string $password, int $creatorId): array
    {
        $names = [
            ['Abdoulaye', 'Ndiaye'], ['Aïssatou', 'Diop'], ['Fatou', 'Fall'], ['Khadim', 'Sarr'],
            ['Mariama', 'Ba'], ['Ousmane', 'Seck'], ['Cheikh', 'Faye'], ['Ibrahima', 'Sy'],
            ['Aminata', 'Diallo'], ['Mame Diarra', 'Ndiaye'], ['Astou', 'Sow'], ['Moussa', 'Gueye'],
            ['Ndeye Fatou', 'Mbaye'], ['Serigne', 'Diagne'], ['Awa', 'Cissé'], ['Mamadou', 'Sène'],
            ['Rama', 'Thiam'], ['Modou', 'Lo'], ['Coumba', 'Kane'], ['Babacar', 'Niang'],
            ['Sokhna', 'Dieng'], ['Alioune', 'Badji'], ['Bineta', 'Gomis'], ['Pape', 'Camara'],
            ['Yacine', 'Dione'], ['Mouhamed', 'Samb'], ['Dieynaba', 'Ndao'], ['El Hadji', 'Tall'],
            ['Rokhaya', 'Wade'], ['Malick', 'Ba'], ['Mbayang', 'Faye'], ['Assane', 'Sow'],
        ];

        $classes = Classe::query()->orderBy('id')->pluck('nom_classe')->all();
        $result = [];

        foreach ($names as $index => [$prenom, $nom]) {
            $classeName = $classes[$index % max(1, count($classes))] ?? 'CI A';
            $emailName = Str::of("{$prenom}.{$nom}.{$index}")
                ->ascii()
                ->lower()
                ->replaceMatches('/[^a-z0-9.]+/', '.')
                ->replaceMatches('/\.+/', '.')
                ->trim('.');
            $email = "{$emailName}@eleve.saytu.edu";
            $parentPhone = '778' . str_pad((string) (100000 + $index), 6, '0', STR_PAD_LEFT);

            $user = $this->upsertUserByEmail([
                'prenom' => $prenom,
                'nom' => $nom,
                'email' => $email,
                'password' => $password,
                'telephone' => '776' . str_pad((string) (200000 + $index), 6, '0', STR_PAD_LEFT),
                'telephone_parent' => $parentPhone,
                'adresse' => ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Diourbel'][$index % 6],
                'date_naissance' => now()->subYears(6 + ($index % 13))->subMonths($index % 10)->format('Y-m-d'),
                'role' => RoleEnum::ELEVE->value,
                'statut' => RoleEnum::ELEVE->value,
                'id_parent_createur' => $creatorId,
                'actif' => true,
                'must_change_password' => false,
            ]);

            $result[] = ['user' => $user, 'classe' => $classeName];
        }

        return $result;
    }

    /**
     * @param array<int, User> $enseignants
     */
    private function attachTeachersToSubjectsAndClasses(array $enseignants): void
    {
        $classes = Classe::query()->get();

        foreach ($enseignants as $enseignant) {
            $matiere = Matieres::query()->where('nom_matiere', $enseignant->specialite)->first();

            if ($matiere) {
                $enseignant->matieres()->sync([$matiere->id]);
            }

            $enseignant->enseignantClasses()->syncWithoutDetaching($classes->pluck('id')->all());
        }
    }

    /**
     * @param array<int, array{user: User, classe: string}> $eleves
     */
    private function attachStudentsToClassesAndCreateAcademicData(array $eleves): void
    {
        foreach ($eleves as $index => $entry) {
            $eleve = $entry['user'];
            $classe = Classe::query()->where('nom_classe', $entry['classe'])->first();

            if (! $classe) {
                continue;
            }

            $eleve->eleveClasses()->sync([$classe->id]);
            $matieres = $classe->matieres()->get();

            foreach ($matieres as $matiereIndex => $matiere) {
                foreach (['Devoir 1', 'Composition'] as $typeIndex => $type) {
                    $value = 9 + (($index + $matiereIndex + $typeIndex) % 10);
                    Note::query()->updateOrCreate(
                        [
                            'id_eleve' => $eleve->id,
                            'id_classe' => $classe->id,
                            'id_matiere' => $matiere->id,
                            'type_evaluation' => $type,
                            'periode' => 'Semestre 1',
                        ],
                        ['valeur' => min(20, $value)]
                    );
                }
            }

            if ($index % 3 === 0) {
                Absence::query()->updateOrCreate(
                    [
                        'id_eleve' => $eleve->id,
                        'date_absence' => now()->subDays(10 + $index)->format('Y-m-d'),
                    ],
                    [
                        'motif' => $index % 2 === 0 ? 'Maladie signalée par le parent' : 'Absence non justifiée',
                        'est_justifiee' => $index % 2 === 0,
                    ]
                );
            }
        }
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function upsertUserByEmail(array $attributes): User
    {
        $user = User::withTrashed()->where('email', $attributes['email'])->first();

        if (! $user) {
            return User::create($attributes);
        }

        $user->forceFill($attributes);

        if ($user->trashed()) {
            $user->restore();
        }

        $user->save();

        return $user;
    }
}
