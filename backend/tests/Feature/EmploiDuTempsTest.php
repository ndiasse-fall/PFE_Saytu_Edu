<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\User;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\EmploiDuTemps;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmploiDuTempsTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAsAdmin(): User
    {
        $user = User::factory()->create([
            'role' => RoleEnum::ADMIN->value,
            'actif' => true,
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    private function authenticateAsEnseignant(): User
    {
        $user = User::factory()->create([
            'role' => RoleEnum::ENSEIGNANT->value,
            'actif' => true,
        ]);
        Sanctum::actingAs($user);
        return $user;
    }

    public function test_admin_can_list_emplois_du_temps(): void
    {
        $this->authenticateAsAdmin();
        EmploiDuTemps::factory()->count(3)->create();

        $response = $this->getJson('/api/emplois-du-temps');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'success',
                'count',
                'data' => [
                    '*' => ['id', 'jour', 'heure_debut', 'heure_fin', 'salle', 'classe', 'enseignant', 'matiere']
                ]
            ]);
    }

    public function test_admin_can_create_emploi_du_temps(): void
    {
        $this->authenticateAsAdmin();
        $classe = Classe::factory()->create();
        $enseignant = User::factory()->enseignant()->create();
        $matiere = Matiere::factory()->create();

        $data = [
            'jour' => 'Lundi',
            'heure_debut' => '08:00',
            'heure_fin' => '10:00',
            'salle' => 'Salle 101',
            'id_classe' => $classe->id,
            'id_enseignant' => $enseignant->id,
            'id_matiere' => $matiere->id,
        ];

        $response = $this->postJson('/api/emplois-du-temps', $data);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.jour', 'Lundi');

        $this->assertDatabaseHas('emploi_du_temps', [
            'jour' => 'Lundi',
            'salle' => 'Salle 101',
            'id_classe' => $classe->id
        ]);
    }

    public function test_cannot_create_conflit_horaire_classe(): void
    {
        $this->authenticateAsAdmin();
        $classe = Classe::factory()->create();
        $enseignant1 = User::factory()->enseignant()->create();
        $enseignant2 = User::factory()->enseignant()->create();
        $matiere = Matiere::factory()->create();

        // Créer un premier cours
        EmploiDuTemps::create([
            'jour' => 'Lundi',
            'heure_debut' => '08:00',
            'heure_fin' => '10:00',
            'salle' => 'Salle 101',
            'id_classe' => $classe->id,
            'id_enseignant' => $enseignant1->id,
            'id_matiere' => $matiere->id,
        ]);

        // Tenter de créer un autre cours pour la même classe sur le même créneau
        $data = [
            'jour' => 'Lundi',
            'heure_debut' => '09:00',
            'heure_fin' => '11:00',
            'salle' => 'Salle 102',
            'id_classe' => $classe->id,
            'id_enseignant' => $enseignant2->id,
            'id_matiere' => $matiere->id,
        ];

        $response = $this->postJson('/api/emplois-du-temps', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id_classe']);
    }

    public function test_admin_can_update_emploi_du_temps(): void
    {
        $this->authenticateAsAdmin();
        $emploi = EmploiDuTemps::factory()->create(['salle' => 'Ancienne Salle']);

        $response = $this->putJson("/api/emplois-du-temps/{$emploi->id}", [
            'jour' => $emploi->jour,
            'heure_debut' => '14:00',
            'heure_fin' => '16:00',
            'salle' => 'Nouvelle Salle',
            'id_classe' => $emploi->id_classe,
            'id_enseignant' => $emploi->id_enseignant,
            'id_matiere' => $emploi->id_matiere,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.salle', 'Nouvelle Salle');

        $this->assertDatabaseHas('emploi_du_temps', [
            'id' => $emploi->id,
            'salle' => 'Nouvelle Salle'
        ]);
    }

    public function test_admin_can_delete_emploi_du_temps(): void
    {
        $this->authenticateAsAdmin();
        $emploi = EmploiDuTemps::factory()->create();

        $response = $this->deleteJson("/api/emplois-du-temps/{$emploi->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('emploi_du_temps', ['id' => $emploi->id]);
    }

    public function test_enseignant_cannot_manage_emploi_du_temps(): void
    {
        $this->authenticateAsEnseignant();
        $emploi = EmploiDuTemps::factory()->create();

        $this->postJson('/api/emplois-du-temps', [])->assertForbidden();
        $this->putJson("/api/emplois-du-temps/{$emploi->id}", [])->assertForbidden();
        $this->deleteJson("/api/emplois-du-temps/{$emploi->id}")->assertForbidden();
    }

    public function test_enseignant_sees_only_their_own_schedule(): void
    {
        $enseignant = $this->authenticateAsEnseignant();
        $autreEnseignant = User::factory()->enseignant()->create();

        // Créer un cours pour cet enseignant
        EmploiDuTemps::factory()->create(['id_enseignant' => $enseignant->id]);
        // Créer un cours pour un autre enseignant
        EmploiDuTemps::factory()->create(['id_enseignant' => $autreEnseignant->id]);

        $response = $this->getJson('/api/emplois-du-temps');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_eleve_sees_only_their_class_schedule(): void
    {
        $user = User::factory()->eleve()->create([
            'actif' => true,
        ]);
        Sanctum::actingAs($user);

        $classe = Classe::factory()->create();
        $autreClasse = Classe::factory()->create();

        // Inscrire l'élève à la classe
        $user->classes()->attach($classe->id);

        // Cours pour sa classe
        EmploiDuTemps::factory()->create(['id_classe' => $classe->id]);
        // Cours pour une autre classe
        EmploiDuTemps::factory()->create(['id_classe' => $autreClasse->id]);

        $response = $this->getJson('/api/emplois-du-temps');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_enseignant_cannot_show_others_schedule(): void
    {
        $this->authenticateAsEnseignant();
        $autreEnseignant = User::factory()->enseignant()->create();
        $emploi = EmploiDuTemps::factory()->create(['id_enseignant' => $autreEnseignant->id]);

        $this->getJson("/api/emplois-du-temps/{$emploi->id}")->assertStatus(404);
    }

    public function test_eleve_cannot_show_others_class_schedule(): void
    {
        $user = User::factory()->eleve()->create(['actif' => true]);
        Sanctum::actingAs($user);

        $autreClasse = Classe::factory()->create();
        $emploi = EmploiDuTemps::factory()->create(['id_classe' => $autreClasse->id]);

        $this->getJson("/api/emplois-du-temps/{$emploi->id}")->assertStatus(404);
    }
}
