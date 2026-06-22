<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['nullable', 'string'],
            'role' => ['required', new Enum(RoleEnum::class)],
            'actif' => ['nullable', 'boolean'],
            'matricule_enseignant' => ['required_if:role,ENSEIGNANT', 'nullable', 'string', 'unique:users,matricule_enseignant'],
            'specialite' => ['required_if:role,ENSEIGNANT', 'nullable', 'string', 'max:255'],
            'date_embauche' => ['required_if:role,ENSEIGNANT', 'nullable', 'date'],
            'matricule_eleve' => ['required_if:role,ELEVE', 'nullable', 'string', 'unique:users,matricule_eleve'],
            'date_naissance' => ['required_if:role,ELEVE', 'nullable', 'date'],
            'telephone_parent' => ['required_if:role,ELEVE', 'nullable', 'string', 'max:20'],
            'statut' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'role.required' => 'Le rôle est obligatoire.',
        ];
    }
}
