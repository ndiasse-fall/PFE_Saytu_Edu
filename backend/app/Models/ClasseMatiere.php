<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ClasseMatiere extends Pivot
{
    use HasFactory;

    protected $table = 'classe_matiere';

    public $incrementing = true;

    protected $fillable = [
        'id_classe',
        'id_matiere',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class, 'id_classe');
    }

    public function matiere()
    {
        return $this->belongsTo(Matieres::class, 'id_matiere');
    }
}
