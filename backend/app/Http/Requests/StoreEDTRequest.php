<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\EmploiDuTemps;
use Illuminate\Validation\Rule;

class StoreEDTRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'jour' => ['required', 'string', Rule::in(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'])],
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'salle' => 'required|string|max:255',

            'id_classe' => 'required|exists:classes,id',
            'id_enseignant' => [
                'required',
                Rule::exists('users', 'id')->where('role', 'ENSEIGNANT'),
            ],
            'id_matiere' => 'required|exists:matieres,id',
            'est_publie' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'heure_fin.after' => 'L\'heure de fin doit être supérieure à l\'heure de début.',
            'id_classe.exists' => 'La classe sélectionnée est invalide.',
            'id_enseignant.exists' => 'L\'enseignant sélectionné est invalide.',
            'id_matiere.exists' => 'La matière sélectionnée est invalide.',
        ];
    }

    public function withValidator(\Illuminate\Validation\Validator $validator)
    {
        $validator->after(function ($validator) {
            $jour = $this->jour;
            $debut = $this->heure_debut;
            $fin = $this->heure_fin;
            $currentId = $this->route('id');

            $classeConflit = EmploiDuTemps::where('id_classe', $this->id_classe)
                ->where('jour', $jour)
                ->when($currentId, fn($q) => $q->where('id', '!=', $currentId))
                ->where('heure_debut', '<', $fin)
                ->where('heure_fin', '>', $debut)
                ->exists();

            if ($classeConflit) {
                $validator->errors()->add(
                    'id_classe',
                    'Cette classe possède déjà un cours sur ce créneau horaire.'
                );
            }

            $enseignantConflit = EmploiDuTemps::where('id_enseignant', $this->id_enseignant)
                ->where('jour', $jour)
                ->when($currentId, fn($q) => $q->where('id', '!=', $currentId))
                ->where('heure_debut', '<', $fin)
                ->where('heure_fin', '>', $debut)
                ->exists();

            if ($enseignantConflit) {
                $validator->errors()->add(
                    'id_enseignant',
                    'Cet enseignant est déjà occupé sur ce créneau horaire.'
                );
            }
        });
    }
}
