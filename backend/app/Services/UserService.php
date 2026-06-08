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
        $data = $this->syncLegacyName($data);

        return User::create($data);
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

        $data = $this->syncLegacyName($data, $user);
        $user->update($data);

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

    private function syncLegacyName(array $data, ?User $user = null): array
    {
        if (! Schema::hasColumn('users', 'name')) {
            return $data;
        }

        $nom = $data['nom'] ?? $user?->nom ?? '';
        $prenom = $data['prenom'] ?? $user?->prenom ?? '';
        $fullName = trim("{$prenom} {$nom}");

        $data['name'] = $fullName !== '' ? $fullName : 'Utilisateur';

        return $data;
    }
}
