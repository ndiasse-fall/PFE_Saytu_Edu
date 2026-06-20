<?php

namespace Tests\Unit;

use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use App\Models\Classe;
use App\Services\BulletinService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulletinServiceTest extends TestCase
{
    use RefreshDatabase;

    private BulletinService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BulletinService();
    }

    public function test_calculer_moyenne_correctement()
    {
        $eleve = User::factory()->eleve()->create();
        $classe = Classe::factory()->create();

        $maths = Matieres::factory()->create(['nom_matiere' => 'Maths', 'coefficient' => 4]);
        $francais = Matieres::factory()->create(['nom_matiere' => 'Français', 'coefficient' => 2]);

        Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $maths->id,
            'valeur' => 15, // 15 * 4 = 60
        ]);

        Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $francais->id,
            'valeur' => 12, // 12 * 2 = 24
        ]);

        // Total points = 60 + 24 = 84
        // Total coef = 4 + 2 = 6
        // Moyenne = 84 / 6 = 14

        $moyenne = $this->service->calculerMoyenne($eleve->id);

        $this->assertEquals(14, $moyenne);
    }

    public function test_retourne_zero_si_pas_de_notes()
    {
        $eleve = User::factory()->eleve()->create();

        $moyenne = $this->service->calculerMoyenne($eleve->id);

        $this->assertEquals(0, $moyenne);
    }
}