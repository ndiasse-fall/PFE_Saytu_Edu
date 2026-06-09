<?php

namespace App\Services;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserService
{
    public function listUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $role = null;
        if (filled($filters['role'] ?? null)) {
            $role = $filters['role'] instanceof RoleEnum
                ? $filters['role']
                : RoleEnum::from($filters['role']);
        }

        return User::query()
            ->search($filters['search'] ?? null)
            ->byRole($role)
            ->active($filters['actif'] ?? null)
            ->latest('id')
            ->paginate($perPage);
    }

    public function createUser(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        $data['actif'] = $data['actif'] ?? true;
        $data = $this->syncLegacyFields($data);

        return User::create($data);
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
        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
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

    public function getDashboardMetrics(): array
    {
        return [
            'total_users' => User::query()->count(),
            'admins' => User::query()->byRole(RoleEnum::ADMIN)->count(),
            'enseignants' => User::query()->byRole(RoleEnum::ENSEIGNANT)->count(),
            'eleves' => User::query()->byRole(RoleEnum::ELEVE)->count(),
        ];
    }

    private function syncLegacyFields(array $data, ?User $user = null): array
    {
        if (! Schema::hasColumn('users', 'name')) {
            $data = $this->syncLegacyRole($data, $user);
            return $data;
        }

        $nom = $data['nom'] ?? $user?->nom ?? '';
        $prenom = $data['prenom'] ?? $user?->prenom ?? '';
        $fullName = trim("{$prenom} {$nom}");

        $data['name'] = $fullName !== '' ? $fullName : 'Utilisateur';
        $data = $this->syncLegacyRole($data, $user);

        return $data;
    }

    private function syncLegacyRole(array $data, ?User $user = null): array
    {
        if (! Schema::hasColumn('users', 'statut')) {
            return $data;
        }

        $role = $data['role'] ?? $user?->resolvedRole();

        if ($role instanceof RoleEnum) {
            $data['statut'] = $role->value;
            return $data;
        }

        if (filled($role)) {
            $data['statut'] = (string) $role;
        }

        return $data;
    }
}
