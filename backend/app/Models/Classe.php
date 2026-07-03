<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
class Classe extends Model
{
    use HasFactory;

    protected $fillable = ['nom_classe', 'niveau', 'annee_scolaire'];

    public function eleves()
    {
        return $this->belongsToMany(User::class, 'classe_eleve', 'id_classe', 'id_eleve');
    }

    public function enseignants()
    {
        return $this->belongsToMany(User::class, 'classe_enseignant', 'id_classe', 'id_enseignant');
    }

    public function emploiDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class, 'id_classe');
    }
    /**
     * Définit la relation plusieurs-à-plusieurs avec le modèle Matiere.
     * Une classe peut avoir plusieurs matières.
     */
    public function matieres(): BelongsToMany
    {
        // Le contrôleur d'affectation a besoin de cette relation pour fonctionner.
        return $this->belongsToMany(Matieres::class, 'classe_matiere', 'id_classe', 'id_matiere');
    }
}