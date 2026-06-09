<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Facturies\HasFactory;

class Note extends Model
{
  Use HasFactory;
  protected $fillable=[
    'valeur',
    'type_evaluation',
    'periode',
    'id_eleve',
    'id_matiere',
    'id_classe',
  ];


  public function eleve()
  {
    return $this->belongsTo (User::class,'id_eleve');
  }
  public function matieres()
  {
    return $this->belongsTo (matiere::class,'id_matiere');
  }
  public function classe()
  {
    return $this->belongsTo (classe::class,'id_classe');
  }
}
