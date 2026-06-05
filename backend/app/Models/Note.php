<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = ['valeur', 'type_evaluation', 'periode', 'id_eleve', 'id_matiere'];

    public function eleve()
    {
        return $this->belongsTo(User::class, 'id_eleve');
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class, 'id_matiere');
    }
}
