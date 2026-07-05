<?php

namespace App\Http\Requests;

use App\Enums\RoleEnum;
use App\Models\Matieres;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

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
            'role' => ['sometimes', 'required', new Enum(RoleEnum::class)],
            'actif' => ['nullable', 'boolean'],
            'matricule_enseignant' => ['nullable', 'string', Rule::unique('users', 'matricule_enseignant')->ignore($userId)],
            'specialite' => [
                Rule::requiredIf(fn() => $this->input('role') === RoleEnum::ENSEIGNANT->value),
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
            'matricule_eleve' => ['nullable', 'string', Rule::unique('users', 'matricule_eleve')->ignore($userId)],
            'date_naissance' => ['nullable', 'date'],
            'telephone_parent' => ['nullable', 'string', 'max:20'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'classe_ids' => ['nullable', 'array'],
            'classe_ids.*' => ['integer', 'exists:classes,id'],
            'matiere_ids' => ['nullable', 'array'],
            'matiere_ids.*' => ['integer', 'exists:matieres,id'],
            'statut' => ['nullable', 'string'],
        ];
    }
}
