<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'statut',
        'id_parent_createur',
        'matricule_enseignant',
        'specialite',
        'date_embauche',
        'matricule_eleve',
        'date_naissance',
        'adresse',
        'telephone_parent'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relations
    public function createur()
    {
        return $this->belongsTo(User::class, 'id_parent_createur');
    }

    public function classes()
    {
        return $this->statut === 'ELEVE'
            ? $this->belongsToMany(Classe::class, 'classe_eleve', 'id_eleve', 'id_classe')
            : $this->belongsToMany(Classe::class, 'classe_enseignant', 'id_enseignant', 'id_classe');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'id_eleve');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'id_eleve');
    }
}