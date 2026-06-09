<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
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
}