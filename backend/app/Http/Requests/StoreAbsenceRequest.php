<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_classe' => ['nullable', 'integer', 'exists:classes,id'],
            'date_absence' => ['required', 'date'],
            'absents' => ['required', 'array', 'min:1'],
            'absents.*' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', 'ELEVE'),
            ],
            'motif' => ['nullable', 'string', 'max:255'],
            'est_justifiee' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_classe.exists' => 'La classe sélectionnée est invalide',
            'date_absence.required' => 'La date d\'absence est obligatoire',
            'date_absence.date' => 'Le format de la date est invalide',
            'absents.required' => 'Vous devez sélectionner au moins un élève absent',
            'absents.array' => 'Le format des absents est invalide',
            'absents.min' => 'Vous devez sélectionner au moins un élève absent',
            'absents.*.integer' => 'L’identifiant de l’élève doit être un entier',
            'absents.*.exists' => 'Un ou plusieurs élèves sélectionnés n’existent pas',
            'motif.string' => 'Le motif doit être une chaîne de caractères',
            'motif.max' => 'Le motif ne doit pas dépasser 255 caractères',
        ];
    }
}
