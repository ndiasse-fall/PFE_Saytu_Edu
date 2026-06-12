<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user');
        $userId = $user?->id;

        return [
            'nom' => ['sometimes', 'required', 'string', 'max:255'],
            'prenom' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', Password::min(8)],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['nullable', 'string'],
            'role' => ['sometimes', 'required', new Enum(RoleEnum::class), Rule::notIn([RoleEnum::SUPER_ADMIN->value])],
            'actif' => ['nullable', 'boolean'],
            'matricule_enseignant' => ['nullable', 'string', Rule::unique('users', 'matricule_enseignant')->ignore($userId)],
            'specialite' => ['nullable', 'string', 'max:255'],
            'date_embauche' => ['nullable', 'date'],
            'matricule_eleve' => ['nullable', 'string', Rule::unique('users', 'matricule_eleve')->ignore($userId)],
            'date_naissance' => ['nullable', 'date'],
            'telephone_parent' => ['nullable', 'string', 'max:20'],
            'statut' => ['nullable', 'string'],
        ];
    }
}
