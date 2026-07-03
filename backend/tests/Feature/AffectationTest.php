<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\ClasseMatiere;
use App\Models\Matieres;
use App\Models\User;
use App\Models\UserMatiere;
use Database\Seeders\ClasseMatiereSeeder;
use Database\Seeders\UserMatiereSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffectationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed matieres first to avoid factory constraint issues
        $this->seed(\Database\Seeders\MatiereSeeder::class);
        // Create an admin user for API requests
        $this->admin = User::factory()->admin()->create();
    }

    /**
     * Test that UserMatiere factory works correctly.
     */
    public function test_user_matiere_factory_creates_record(): void
    {
        $userMatiere = UserMatiere::factory()->create();

        $this->assertDatabaseHas('user_matiere', [
            'id' => $userMatiere->id,
            'id_user' => $userMatiere->id_user,
            'id_matiere' => $userMatiere->id_matiere,
        ]);
        
        $this->assertTrue($userMatiere->user->isEnseignant());
    }

    /**
     * Test that ClasseMatiere factory works correctly.
     */
    public function test_classe_matiere_factory_creates_record(): void
    {
        $classeMatiere = ClasseMatiere::factory()->create();

        $this->assertDatabaseHas('classe_matiere', [
            'id' => $classeMatiere->id,
            'id_classe' => $classeMatiere->id_classe,
            'id_matiere' => $classeMatiere->id_matiere,
        ]);
    }

    /**
     * Test that UserMatiereSeeder works correctly.
     */
    public function test_user_matiere_seeder_seeds_correctly(): void
    {
        // Setup initial teachers (subjects are already seeded in setUp)
        User::factory()->enseignant()->count(3)->create();

        $this->seed(UserMatiereSeeder::class);

        // Check that each teacher has at least one subject assigned
        $teachers = User::where('role', 'ENSEIGNANT')->get();
        $this->assertNotEmpty($teachers);
        foreach ($teachers as $teacher) {
            $this->assertGreaterThanOrEqual(1, $teacher->matieres()->count());
        }
    }

    /**
     * Test that ClasseMatiereSeeder works correctly.
     */
    public function test_classe_matiere_seeder_seeds_correctly(): void
    {
        // Setup initial classes (subjects are already seeded in setUp)
        Classe::factory()->count(3)->create();

        $this->seed(ClasseMatiereSeeder::class);

        // Check that each class has at least 3 subjects assigned (since seeder assigns rand(3, 6))
        $classes = Classe::all();
        $this->assertNotEmpty($classes);
        foreach ($classes as $classe) {
            $this->assertGreaterThanOrEqual(3, $classe->matieres()->count());
        }
    }

    /**
     * Test listing affectations.
     */
    public function test_can_list_affectations(): void
    {
        $classeMatiere = ClasseMatiere::factory()->create();
        $userMatiere = UserMatiere::factory()->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/affectations');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => "cm-{$classeMatiere->id_classe}-{$classeMatiere->id_matiere}",
                'type' => 'Matière à Classe',
            ])
            ->assertJsonFragment([
                'id' => "em-{$userMatiere->id_user}-{$userMatiere->id_matiere}",
                'type' => 'Enseignant à Matière',
            ]);
    }

    /**
     * Test affecting a subject to a class via API.
     */
    public function test_can_affecter_matiere_classe(): void
    {
        $classe = Classe::factory()->create();
        $matiere = Matieres::inRandomOrder()->first();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/affectations/matiere-classe', [
                'classe_id' => $classe->id,
                'matiere_id' => $matiere->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Matière affectée à la classe avec succès.',
            ]);

        $this->assertDatabaseHas('classe_matiere', [
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
        ]);
    }

    public function test_can_affecter_enseignant_matiere(): void
    {
        $enseignant = User::factory()->enseignant()->create();
        $matiere = Matieres::where('nom_matiere', $enseignant->specialite)->first();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/affectations/enseignant-matiere', [
                'enseignant_id' => $enseignant->id,
                'matiere_id' => $matiere->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Enseignant été affecté à la matière avec succès.',
            ]);

        $this->assertDatabaseHas('user_matiere', [
            'id_user' => $enseignant->id,
            'id_matiere' => $matiere->id,
        ]);
    }

    /**
     * Test cannot affect teacher to a subject that is not their specialty.
     */
    public function test_cannot_affecter_enseignant_to_non_specialite_matiere(): void
    {
        $enseignant = User::factory()->enseignant()->create(['specialite' => 'Mathématiques']);
        $matiere = Matieres::where('nom_matiere', 'Français')->first();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/affectations/enseignant-matiere', [
                'enseignant_id' => $enseignant->id,
                'matiere_id' => $matiere->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'La spécialité de l\'enseignant doit être égale à la matière affectée.',
            ]);

        $this->assertDatabaseMissing('user_matiere', [
            'id_user' => $enseignant->id,
            'id_matiere' => $matiere->id,
        ]);
    }

    /**
     * Test cannot affect non-teacher user to subject.
     */
    public function test_cannot_affecter_non_enseignant_to_matiere(): void
    {
        $eleve = User::factory()->eleve()->create();
        $matiere = Matieres::inRandomOrder()->first();

        $response = $this->actingAs($this->admin)
            ->postJson('/api/affectations/enseignant-matiere', [
                'enseignant_id' => $eleve->id,
                'matiere_id' => $matiere->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'L\'utilisateur sélectionné n\'est pas un enseignant.',
            ]);

        $this->assertDatabaseMissing('user_matiere', [
            'id_user' => $eleve->id,
            'id_matiere' => $matiere->id,
        ]);
    }

    /**
     * Test deleting a subject-class affectation.
     */
    public function test_can_delete_affectation_matiere_classe(): void
    {
        $classeMatiere = ClasseMatiere::factory()->create();

        $compositeId = "cm-{$classeMatiere->id_classe}-{$classeMatiere->id_matiere}";

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/affectations/{$compositeId}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'L\'affectation matière-classe a été supprimée avec succès.',
            ]);

        $this->assertDatabaseMissing('classe_matiere', [
            'id_classe' => $classeMatiere->id_classe,
            'id_matiere' => $classeMatiere->id_matiere,
        ]);
    }

    /**
     * Test deleting a teacher-subject affectation.
     */
    public function test_can_delete_affectation_enseignant_matiere(): void
    {
        $userMatiere = UserMatiere::factory()->create();

        $compositeId = "em-{$userMatiere->id_user}-{$userMatiere->id_matiere}";

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/affectations/{$compositeId}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'L\'affectation enseignant-matière a été supprimée avec succès.',
            ]);

        $this->assertDatabaseMissing('user_matiere', [
            'id_user' => $userMatiere->id_user,
            'id_matiere' => $userMatiere->id_matiere,
        ]);
    }
}
