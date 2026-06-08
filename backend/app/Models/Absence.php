<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = ['date_absence', 'motif', 'est_justifiee', 'id_eleve'];

    public function eleve()
    {
        return $this->belongsTo(User::class, 'id_eleve');
    }
}
