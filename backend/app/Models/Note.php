<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    use HasFactory;

    protected $fillable = ['valeur', 'type_evaluation', 'periode', 'id_eleve', 'id_matiere', 'id_classe'];

    public function eleve()
    {
        return $this->belongsTo(User::class, 'id_eleve');
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class, 'id_matiere');
    }
    /**
     * Obtenir la classe associée à cette note.
     */
    public function classe(): BelongsTo
    {
        // Spécifiez la clé étrangère si elle ne suit pas la convention Laravel (id_classe)
        return $this->belongsTo(Classe::class, 'id_classe');
    }
}