<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
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

        return $query->where(function (Builder $builder) use ($roleValue): void {
            $builder->where('role', $roleValue);

            if ($this->hasLegacyStatutColumn()) {
                $builder->orWhere('statut', $roleValue);
            }
        });
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
        return $this->resolvedRole() === RoleEnum::ELEVE->value
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
        return $this->resolvedRole() === RoleEnum::SUPER_ADMIN->value;
    }

    public function isAdministrateur(): bool
    {
        return $this->resolvedRole() === RoleEnum::ADMIN->value;
    }

    public function isEnseignant(): bool
    {
        return $this->resolvedRole() === RoleEnum::ENSEIGNANT->value;
    }

    public function isEleve(): bool
    {
        return $this->resolvedRole() === RoleEnum::ELEVE->value;
    }

    public function resolvedRole(): ?string
    {
        if ($this->role instanceof RoleEnum) {
            return $this->role->value;
        }

        if (filled($this->role)) {
            return (string) $this->role;
        }

        return filled($this->statut) ? (string) $this->statut : null;
    }

    public function fullName(): string
    {
        $fullName = trim("{$this->prenom} {$this->nom}");

        if ($fullName !== '') {
            return $fullName;
        }

        return (string) ($this->name ?? 'Utilisateur');
    }

    private function hasLegacyStatutColumn(): bool
    {
        static $hasLegacyStatutColumn;

        return $hasLegacyStatutColumn ??= \Illuminate\Support\Facades\Schema::hasColumn('users', 'statut');
    }
}
