<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
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
        'telephone_parent',
        'telephone',
        'role',
        'actif',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => RoleEnum::class,
            'actif' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'date_embauche' => 'date',
            'date_naissance' => 'date',
        ];
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('nom', 'like', "%{$search}%")
                ->orWhere('prenom', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('telephone', 'like', "%{$search}%");
        });
    }

    public function scopeByRole(Builder $query, RoleEnum|string|null $role): Builder
    {
        if (blank($role)) {
            return $query;
        }

        $roleValue = $role instanceof RoleEnum ? $role->value : $role;

        return $query->where('role', $roleValue);
    }

    public function scopeActive(Builder $query, ?bool $actif): Builder
    {
        if ($actif === null) {
            return $query;
        }

        return $query->where('actif', $actif);
    }

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

    public function isSuperAdministrateur(): bool
    {
        return $this->role === RoleEnum::SUPER_ADMIN;
    }

    public function isAdministrateur(): bool
    {
        return $this->role === RoleEnum::ADMIN;
    }

    public function isEnseignant(): bool
    {
        return $this->role === RoleEnum::ENSEIGNANT;
    }

    public function isEleve(): bool
    {
        return $this->role === RoleEnum::ELEVE;
    }
}