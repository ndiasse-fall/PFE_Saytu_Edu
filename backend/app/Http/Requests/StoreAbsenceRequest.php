<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    /**
     * Autoriser la requête
     */
    public function authorize(): bool
    {
        return true; // IMPORTANT sinon 403
    }

    /**
     * Règles de validation
     */
    public function rules(): array
    {
        return [
            'date_absence' => 'required|date',
            'absents' => 'required|array|min:1',
            'absents.*' => 'integer|exists:users,id',
            'motif' => 'nullable|string|max:255',
        ];
    }

    /**
     * Messages personnalisés
     */
    public function messages(): array
    {
        return [
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