<?php

namespace App\Models;

use App\Enums\RoleEnum;
use App\Models\Matieres;
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
        'must_change_password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = [
        'classes',
    ];

    protected function casts(): array
    {
        return [
            'role' => RoleEnum::class,
            'actif' => 'boolean',
            'must_change_password' => 'boolean',
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
        $role = $this->role instanceof RoleEnum ? $this->role->value : ($this->role ?? $this->statut);

        if ($role === 'ELEVE') {
            return $this->eleveClasses();
        }

        return $this->enseignantClasses();
    }

    public function eleveClasses()
    {
        return $this->belongsToMany(Classe::class, 'classe_eleve', 'id_eleve', 'id_classe');
    }

    public function enseignantClasses()
    {
        return $this->belongsToMany(Classe::class, 'classe_enseignant', 'id_enseignant', 'id_classe');
    }

    /**
     * Accesseur pour récupérer les classes quelle que soit la relation chargée.
     * Utile pour l'Eager Loading car la relation dynamique 'classes()' ne fonctionne pas bien avec with().
     */
    public function getClassesAttribute()
    {
        // On récupère la relation chargée
        $classes = $this->relationLoaded('eleveClasses')
            ? $this->eleveClasses
            : ($this->relationLoaded('enseignantClasses') ? $this->enseignantClasses : null);

        if ($classes) {
            return $classes;
        }

        if ($this->relationLoaded('classes')) {
            return $this->relations['classes'];
        }

        // Lazy loading fallback
        return $this->classes()->get();
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'id_eleve');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'id_eleve');
    }

    public function matieres()
    {
        return $this->belongsToMany(Matieres::class, 'user_matiere', 'id_user', 'id_matiere');
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

    public function fullName(): string
    {
        $fullName = trim("{$this->prenom} {$this->nom}");

        if ($fullName !== '') {
            return $fullName;
        }

        return (string) ($this->name ?? 'Utilisateur');
    }

    public function resolvedRole(): string
    {
        if ($this->role instanceof RoleEnum) {
            return $this->role->value;
        }

        return (string) ($this->role ?? $this->statut);
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            $role = $user->resolvedRole();

            if ($role === 'ENSEIGNANT' && blank($user->specialite)) {
                $user->specialite = Matieres::query()->inRandomOrder()->value('nom_matiere')
                    ?? Matieres::factory()->create()->nom_matiere;
            }

            if ($role === 'ELEVE') {
                if (empty($user->matricule_eleve)) {
                    $user->matricule_eleve = self::generateMatriculeEleve();
                }
            } elseif ($role === 'ENSEIGNANT') {
                if (empty($user->matricule_enseignant)) {
                    $user->matricule_enseignant = self::generateMatriculeEnseignant();
                }
            }
        });
    }

    public static function generateMatriculeEleve(): string
    {
        $year = date('Y');
        $prefix = "ELV-{$year}";

        $lastUser = self::withTrashed()
            ->where('matricule_eleve', 'LIKE', "{$prefix}%")
            ->orderByRaw('LENGTH(matricule_eleve) DESC')
            ->orderBy('matricule_eleve', 'desc')
            ->first();

        if ($lastUser && preg_match('/ELV-\d{4}(\d+)/', $lastUser->matricule_eleve, $matches)) {
            $lastNumber = (int) $matches[1];
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $suffix = str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
        $matricule = "{$prefix}{$suffix}";

        while (self::withTrashed()->where('matricule_eleve', $matricule)->exists()) {
            $nextNumber++;
            $suffix = str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
            $matricule = "{$prefix}{$suffix}";
        }

        return $matricule;
    }

    public static function generateMatriculeEnseignant(): string
    {
        $year = date('Y');
        $prefix = "ENS-{$year}";

        $lastUser = self::withTrashed()
            ->where('matricule_enseignant', 'LIKE', "{$prefix}%")
            ->orderByRaw('LENGTH(matricule_enseignant) DESC')
            ->orderBy('matricule_enseignant', 'desc')
            ->first();

        if ($lastUser && preg_match('/ENS-\d{4}(\d+)/', $lastUser->matricule_enseignant, $matches)) {
            $lastNumber = (int) $matches[1];
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $suffix = str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
        $matricule = "{$prefix}{$suffix}";

        while (self::withTrashed()->where('matricule_enseignant', $matricule)->exists()) {
            $nextNumber++;
            $suffix = str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
            $matricule = "{$prefix}{$suffix}";
        }

        return $matricule;
    }
}
