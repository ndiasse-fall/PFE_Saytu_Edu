<?php

namespace App\Models;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modèle représentant un utilisateur du système.
 * Gère les différents rôles (SUPER_ADMIN, ADMIN, ENSEIGNANT, ELEVE).
 */
class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use SoftDeletes;

    /**
     * Les attributs qui peuvent être assignés en masse.
     * 
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
     * Les attributs qui doivent être cachés pour la sérialisation.
     * 
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Définition des types de colonnes (casting).
     * 
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

    /**
     * Scope pour la recherche textuelle (nom, prénom, email, téléphone).
     */
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

    /**
     * Scope pour filtrer par rôle.
     */
    public function scopeByRole(Builder $query, RoleEnum|string|null $role): Builder
    {
        if (blank($role)) {
            return $query;
        }

        $roleValue = $role instanceof RoleEnum ? $role->value : $role;

        return $query->where('role', $roleValue);
    }

    /**
     * Scope pour filtrer par statut actif/inactif.
     */
    public function scopeActive(Builder $query, ?bool $actif): Builder
    {
        if ($actif === null) {
            return $query;
        }

        return $query->where('actif', $actif);
    }

    /**
     * Relation vers le créateur de l'utilisateur (le parent).
     */
    public function createur()
    {
        return $this->belongsTo(User::class, 'id_parent_createur');
    }

    /**
     * Relation vers les classes.
     * Si c'est un élève, via classe_eleve.
     * Si c'est un enseignant, via classe_enseignant.
     */
    public function classes()
    {
        return $this->statut === 'ELEVE'
            ? $this->belongsToMany(Classe::class, 'classe_eleve', 'id_eleve', 'id_classe')
            : $this->belongsToMany(Classe::class, 'classe_enseignant', 'id_enseignant', 'id_classe');
    }

    /**
     * Relation vers les notes (pour les élèves).
     */
    public function notes()
    {
        return $this->hasMany(Note::class, 'id_eleve');
    }

    /**
     * Relation vers les absences (pour les élèves).
     */
    public function absences()
    {
        return $this->hasMany(Absence::class, 'id_eleve');
    }

    /**
     * Vérifie si l'utilisateur est un super administrateur.
     */
    public function isSuperAdministrateur(): bool
    {
        return $this->role === RoleEnum::SUPER_ADMIN;
    }

    /**
     * Vérifie si l'utilisateur est un administrateur.
     */
    public function isAdministrateur(): bool
    {
        return $this->role === RoleEnum::ADMIN;
    }

    /**
     * Vérifie si l'utilisateur est un enseignant.
     */
    public function isEnseignant(): bool
    {
        return $this->role === RoleEnum::ENSEIGNANT;
    }

    /**
     * Vérifie si l'utilisateur est un élève.
     */
    public function isEleve(): bool
    {
        return $this->role === RoleEnum::ELEVE;
    }

    /**
     * Retourne le rôle de l'utilisateur sous forme de chaîne.
     */
    public function resolvedRole(): string
    {
        if ($this->role instanceof RoleEnum) {
            return $this->role->value;
        }

        return (string) ($this->role ?? $this->statut);
    }
}