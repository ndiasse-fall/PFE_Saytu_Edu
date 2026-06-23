<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matieres extends Model
{
    use HasFactory;

    protected $fillable = ['nom_matiere', 'coefficient', 'description'];

    public function notes()
    {
        return $this->hasMany(Note::class, 'id_matiere');
    }

    public function emploiDuTemps()
    {
        return $this->hasMany(EmploiDuTemps::class, 'id_matiere');
    }
     public function classes()
    {
        return $this->belongsToMany(Classe::class, 'classe_matiere', 'id_matiere', 'id_classe');
    }

    public function enseignants()
    {
        return $this->belongsToMany(User::class, 'enseignant_matiere', 'id_matiere', 'id_enseignant');
    }
    
}