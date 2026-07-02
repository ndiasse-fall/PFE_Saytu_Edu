<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        'id_classe' => ['required', 'integer', 'exists:classes,id'],
        'date_absence' => 'required|date',
        'absents' => 'required|array|min:1',
        'absents.*' => [
            'required',
            'integer',
            Rule::exists('users', 'id')->where('role', 'ELEVE'),
        ],
        'motif' => 'nullable|string|max:255',
    ];
}

    /**
     * Messages personnalisés (optionnel mais pro)
     */
  public function messages(): array
{
    return [
        'id_classe.required' => 'La classe est obligatoire',
        'date_absence.required' => 'La date d\'absence est obligatoire',
        'date_absence.date' => 'Format de date invalide',
        'absents.required' => 'Vous devez sélectionner au moins un élève absent',
        'absents.array' => 'Format des absents invalide',
        'absents.*.exists' => 'Un ou plusieurs élèves sélectionnés sont invalides',
    ];
}
}
