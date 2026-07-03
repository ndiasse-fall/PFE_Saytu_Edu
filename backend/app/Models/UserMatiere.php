<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserMatiere extends Pivot
{
    use HasFactory;

    protected $table = 'user_matiere';

    public $incrementing = true;

    protected $fillable = [
        'id_user',
        'id_matiere',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function matiere()
    {
        return $this->belongsTo(Matieres::class, 'id_matiere');
    }
}
