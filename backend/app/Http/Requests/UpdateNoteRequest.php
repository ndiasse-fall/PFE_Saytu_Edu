<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNoteRequest extends FormRequest
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
            'valeur' => ['sometimes', 'required', 'numeric', 'min:0', 'max:20'],
            'type_evaluation' => ['sometimes', 'required', 'string', 'max:100', Rule::in([
                'Devoir 1',
                'Devoir 2',
                'Composition',
            ])],
            'periode' => ['sometimes', 'required', 'string', 'max:100', Rule::in(['Semestre 1', 'Semestre 2'])],
            'id_matiere' => ['sometimes', 'required', 'integer', 'exists:matieres,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'valeur.max' => 'La note ne peut pas dépasser 20.',
            'valeur.min' => 'La note ne peut pas être inférieure à 0.',
        ];
    }
}
