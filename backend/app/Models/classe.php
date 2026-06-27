<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
       public function matieres()
    {
        return $this->belongsToMany(Matieres::class, 'classe_matiere', 'id_classe', 'id_matiere');
    }
}
