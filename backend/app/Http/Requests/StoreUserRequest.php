<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use App\Models\Matieres;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
            'password' => [
                Rule::requiredIf(fn(): bool => $this->input('role') === RoleEnum::ADMIN->value),
                'nullable',
                'string',
                Password::min(8),
            ],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['nullable', 'string'],
            'role' => ['required', new Enum(RoleEnum::class)],
            'actif' => ['nullable', 'boolean'],
            'matricule_enseignant' => ['nullable', 'string', 'unique:users,matricule_enseignant'],
            'specialite' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail): void {
                    if (blank($value)) {
                        return;
                    }

                    $normalizedValue = Str::lower(Str::ascii($value));

                    $exists = Matieres::query()
                        ->get()
                        ->contains(function ($matiere) use ($normalizedValue): bool {
                            $normalizedMatiere = Str::lower(Str::ascii($matiere->nom_matiere));

                            return Str::contains($normalizedMatiere, $normalizedValue)
                                || Str::contains($normalizedValue, $normalizedMatiere);
                        });

                    if (! $exists) {
                        $fail('La spécialité doit correspondre à une matière existante.');
                    }
                },
            ],
            'date_embauche' => ['nullable', 'date'],
            'matricule_eleve' => ['nullable', 'string', 'unique:users,matricule_eleve'],
            'date_naissance' => ['nullable', 'date'],
            'telephone_parent' => ['nullable', 'string', 'max:20'],
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
            'password.required' => 'Le mot de passe est obligatoire pour un administrateur.',
            'role.required' => 'Le rôle est obligatoire.',
            'specialite.required' => 'La spécialité est obligatoire pour un enseignant.',
            'specialite.exists' => 'La spécialité doit correspondre à une matière existante.',
        ];
    }
}
