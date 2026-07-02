<?php

namespace App\Services;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function getDashboardSummary(): array
    {
        $counts = User::query()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN role = ? THEN 1 ELSE 0 END) as admins', [RoleEnum::ADMIN->value])
            ->selectRaw('SUM(CASE WHEN role = ? THEN 1 ELSE 0 END) as eleves', [RoleEnum::ELEVE->value])
            ->selectRaw('SUM(CASE WHEN role = ? THEN 1 ELSE 0 END) as enseignants', [RoleEnum::ENSEIGNANT->value])
            ->selectRaw('SUM(CASE WHEN actif = 1 THEN 1 ELSE 0 END) as actifs')
            ->selectRaw('SUM(CASE WHEN actif = 0 THEN 1 ELSE 0 END) as inactifs')
            ->selectRaw(
                'SUM(CASE WHEN telephone IS NULL OR telephone = ? OR adresse IS NULL OR adresse = ? THEN 1 ELSE 0 END) as profils_incomplets',
                ['', '']
            )
            ->first();

        return [
            'counts' => [
                'total' => (int) ($counts?->total ?? 0),
                'admins' => (int) ($counts?->admins ?? 0),
                'eleves' => (int) ($counts?->eleves ?? 0),
                'enseignants' => (int) ($counts?->enseignants ?? 0),
                'actifs' => (int) ($counts?->actifs ?? 0),
                'inactifs' => (int) ($counts?->inactifs ?? 0),
                'profils_incomplets' => (int) ($counts?->profils_incomplets ?? 0),
            ],
            'recent_teachers' => $this->recentTeachers(),
        ];
    }

    public function listUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $role = null;
        if (filled($filters['role'] ?? null)) {
            $role = $filters['role'] instanceof RoleEnum
                ? $filters['role']
                : RoleEnum::from($filters['role']);
        }

        $query = User::query();

        // On charge la relation appropriée pour l'Eager Loading
        if ($role === RoleEnum::ELEVE) {
            $query->with('eleveClasses');
        } elseif ($role === RoleEnum::ENSEIGNANT) {
            $query->with('enseignantClasses');
        } else {
            $query->with(['eleveClasses', 'enseignantClasses']);
        }

        if (isset($filters['affecte']) && $filters['affecte'] !== null && $filters['affecte'] !== '') {
            $affecte = filter_var($filters['affecte'], FILTER_VALIDATE_BOOLEAN);
            if ($role === RoleEnum::ELEVE) {
                if ($affecte) {
                    $query->has('eleveClasses');
                } else {
                    $query->doesntHave('eleveClasses');
                }
            } elseif ($role === RoleEnum::ENSEIGNANT) {
                if ($affecte) {
                    $query->has('enseignantClasses');
                } else {
                    $query->doesntHave('enseignantClasses');
                }
            } else {
                if ($affecte) {
                    $query->where(function ($q) {
                        $q->has('eleveClasses')->orHas('enseignantClasses');
                    });
                } else {
                    $query->doesntHave('eleveClasses')->doesntHave('enseignantClasses');
                }
            }
        }

        return $query->withoutTrashed()
            ->search($filters['search'] ?? null)
            ->byRole($role)
            ->active($filters['actif'] ?? null)
            ->latest('id')
            ->paginate($perPage);
    }

    public function createUser(array $data): User
    {
        $this->assertSuperAdminRoleIsNotManagedHere($data);
        $explicitStudentMatricule = filled($data['matricule_eleve'] ?? null);
        $explicitTeacherMatricule = filled($data['matricule_enseignant'] ?? null);

        $generatedPassword = blank($data['password'] ?? null)
            && $this->roleUsesTemporaryPassword($data['role'] ?? null);

        $plainPassword = $generatedPassword
            ? $this->generateTemporaryPassword()
            : (string) $data['password'];

        $data['password'] = Hash::make($plainPassword);
        $data['actif'] = $data['actif'] ?? true;
        $data['must_change_password'] = $generatedPassword;
        $data = $this->syncLegacyFields($data);

        $user = $this->createUserWithMatriculeRetry(
            $data,
            $explicitStudentMatricule || $explicitTeacherMatricule
        );
        $user->setAttribute('temporary_password', $generatedPassword ? $plainPassword : null);

        event(new \App\Events\UserCreated($user, $plainPassword));

        return $user;
    }


    public function createAdmin(array $data, ?User $creator = null): User
    {
        $name = trim((string) ($data['name'] ?? ''));
        $nameParts = preg_split('/\s+/', $name, 2, PREG_SPLIT_NO_EMPTY) ?: [];

        $payload = [
            'nom' => $data['nom'] ?? ($nameParts[1] ?? $nameParts[0] ?? 'Admin'),
            'prenom' => $data['prenom'] ?? ($nameParts[0] ?? 'Saytou'),
            'email' => $data['email'],
            'password' => $data['password'],
            'telephone' => $data['telephone'] ?? null,
            'adresse' => $data['adresse'] ?? null,
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ];

        if ($creator) {
            $payload['id_parent_createur'] = $creator->id;
        }

        return $this->createUser($payload);
    }

    public function showUser(User $user): User
    {
        if ($user->role === RoleEnum::ELEVE || $user->statut === 'ELEVE') {
            $user->load('eleveClasses');
        } elseif ($user->role === RoleEnum::ENSEIGNANT || $user->statut === 'ENSEIGNANT') {
            $user->load('enseignantClasses');
        }

        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
        $this->assertSuperAdminRoleIsNotManagedHere($data);

        if (array_key_exists('password', $data) && filled($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $data = $this->syncLegacyFields($data, $user);
        $user->update($data);

        return $user->fresh();
    }

    public function updateUserRole(User $user, RoleEnum|string $role): User
    {
        $user->forceFill($this->syncLegacyFields([
            'role' => $role instanceof RoleEnum ? $role : RoleEnum::from($role),
        ], $user))->save();

        return $user->fresh();
    }

    public function deleteUser(User $user): void
    {
        $user->delete();
    }

    public function toggleActive(User $user): User
    {
        $user->forceFill(['actif' => ! $user->actif])->save();

        return $user->fresh();
    }

    public function assignClassesToEnseignant(User $user, array $classeIds): User
    {
        $role = $user->role instanceof RoleEnum ? $user->role->value : $user->resolvedRole();

        if ($role !== RoleEnum::ENSEIGNANT->value) {
            throw ValidationException::withMessages([
                'user' => "Cet utilisateur n'est pas un enseignant.",
            ]);
        }

        $user->enseignantClasses()->sync($classeIds);

        return $user->fresh('enseignantClasses');
    }

    public function getDashboardMetrics(): array
    {
        return [
            'total_users' => User::query()->count(),
            'admins' => User::query()->byRole(RoleEnum::ADMIN)->count(),
            'enseignants' => User::query()->byRole(RoleEnum::ENSEIGNANT)->count(),
            'eleves' => User::query()->byRole(RoleEnum::ELEVE)->count(),
        ];
    }

    private function recentTeachers(): Collection
    {
        return User::query()
            ->where('role', RoleEnum::ENSEIGNANT->value)
            ->latest('id')
            ->limit(5)
            ->get();
    }

    private function syncLegacyFields(array $data, ?User $user = null): array
    {
        if (! Schema::hasColumn('users', 'name')) {
            return $this->syncLegacyRole($data, $user);
        }

        $nom = $data['nom'] ?? $user?->nom ?? '';
        $prenom = $data['prenom'] ?? $user?->prenom ?? '';
        $fullName = trim("{$prenom} {$nom}");

        $data['name'] = $fullName !== '' ? $fullName : 'Utilisateur';

        return $this->syncLegacyRole($data, $user);
    }

    private function syncLegacyRole(array $data, ?User $user = null): array
    {
        if (! Schema::hasColumn('users', 'statut')) {
            return $data;
        }

        $role = $data['role'] ?? $user?->resolvedRole();

        if ($role instanceof RoleEnum) {
            $data['statut'] = $role->value;
        } elseif (filled($role)) {
            $data['statut'] = (string) $role;
        }

        return $data;
    }

    private function assertSuperAdminRoleIsNotManagedHere(array $data): void
    {
        $role = $data['role'] ?? null;

        if ($role !== RoleEnum::SUPER_ADMIN->value && $role !== RoleEnum::SUPER_ADMIN) {
            return;
        }

        throw ValidationException::withMessages([
            'role' => 'Le compte Super Admin est réservé au seeder système.',
        ]);
    }
}
