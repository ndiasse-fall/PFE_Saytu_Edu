<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'type_evaluation' => ['sometimes', 'required', 'string', 'max:100'],
            'periode' => ['sometimes', 'required', 'string', 'max:100'],
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
