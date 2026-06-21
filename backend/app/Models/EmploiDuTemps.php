<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model
{
    use HasFactory;

    protected $table = 'emploi_du_temps';

    protected $fillable = [
        'jour',
        'heure_debut',
        'heure_fin',
        'salle',
        'id_classe',
        'id_enseignant',
        'id_matiere'
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class, 'id_classe');
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'id_enseignant');
    }

    public function matiere()
    {
        return $this->belongsTo(Matieres::class, 'id_matiere');
    }
}