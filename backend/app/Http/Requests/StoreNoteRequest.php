<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
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
            'id_classe' => ['required', 'integer', 'exists:classes,id'],
            'id_matieres' => ['required', 'integer', 'exists:matieres,id'],
            'type_evaluation' => ['required', 'string', 'max:100'],
            'periode' => ['required', 'string', 'max:100'],
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.id_eleve' => ['required', 'integer', 'exists:users,id'],
            'notes.*.valeur' => ['required', 'numeric', 'min:0', 'max:20'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_classe.required' => 'La classe est obligatoire.',
            'id_matieres.required' => 'La matière est obligatoire.',
            'type_evaluation.required' => 'Le type d\'évaluation est obligatoire.',
            'periode.required' => 'La période est obligatoire.',
            'notes.required' => 'Au moins une note doit être fournie.',
            'notes.*.id_eleve.exists' => 'Un élève sélectionné est introuvable.',
            'notes.*.valeur.max' => 'La note ne peut pas dépasser 20.',
        ];
    }
}