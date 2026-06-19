<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bulletin extends Model
{
    use HasFactory;

    protected $fillable = ['periode', 'moyenne_generale', 'rang', 'id_eleve', 'id_classe'];

    public function eleve()
    {
        return $this->belongsTo(User::class, 'id_eleve');
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class, 'id_classe');
    }
}
