<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AbsenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_enseignant_can_create_absences_for_his_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        $classe = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create(['actif' => true]);

        $classe->enseignants()->attach($enseignant->id);
        $classe->eleves()->attach($eleve->id);

        Sanctum::actingAs($enseignant);

        $this->postJson('/api/absences/enregistrer', [
            'id_classe' => $classe->id,
            'date_absence' => '2026-07-02',
            'motif' => 'Maladie',
            'absents' => [$eleve->id],
        ])
            ->assertCreated()
            ->assertJsonPath('total', 1);

        $this->assertDatabaseHas('absences', [
            'id_eleve' => $eleve->id,
            'date_absence' => '2026-07-02',
            'motif' => 'Maladie',
            'est_justifiee' => false,
        ]);
    }

    public function test_enseignant_cannot_create_absence_for_unassigned_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        $classe = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create(['actif' => true]);

        $classe->eleves()->attach($eleve->id);

        Sanctum::actingAs($enseignant);

        $this->postJson('/api/absences/enregistrer', [
            'id_classe' => $classe->id,
            'date_absence' => '2026-07-02',
            'absents' => [$eleve->id],
        ])->assertForbidden();
    }

    public function test_cannot_create_absence_for_student_outside_class(): void
    {
        $admin = User::factory()->admin()->create(['actif' => true]);
        $classe = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create(['actif' => true]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/absences/enregistrer', [
            'id_classe' => $classe->id,
            'date_absence' => '2026-07-02',
            'absents' => [$eleve->id],
        ])
            ->assertUnprocessable()
            ->assertJsonPath('invalid_eleve_ids.0', $eleve->id);
    }

    public function test_eleve_only_sees_his_absences(): void
    {
        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $otherEleve = User::factory()->eleve()->create(['actif' => true]);

        Absence::factory()->create(['id_eleve' => $eleve->id, 'date_absence' => '2026-07-02']);
        Absence::factory()->create(['id_eleve' => $otherEleve->id, 'date_absence' => '2026-07-03']);

        Sanctum::actingAs($eleve);

        $this->getJson('/api/absences')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id_eleve', $eleve->id);
    }

    public function test_enseignant_can_justify_absence_in_his_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        $classe = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create(['actif' => true]);

        $classe->enseignants()->attach($enseignant->id);
        $classe->eleves()->attach($eleve->id);

        $absence = Absence::factory()->create([
            'id_eleve' => $eleve->id,
            'est_justifiee' => false,
        ]);

        Sanctum::actingAs($enseignant);

        $this->putJson("/api/absences/{$absence->id}", [
            'motif' => 'Certificat médical',
            'est_justifiee' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.est_justifiee', true);

        $this->assertDatabaseHas('absences', [
            'id' => $absence->id,
            'motif' => 'Certificat médical',
            'est_justifiee' => true,
        ]);
    }
}
