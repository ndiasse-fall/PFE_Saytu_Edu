<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\EmploiDuTemps;

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
            'jour' => 'required|string|max:20',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'salle' => 'required|string|max:255',

            'id_classe' => 'required|exists:classes,id',
            'id_enseignant' => 'required|exists:users,id',
            'id_matiere' => 'required|exists:matieres,id',
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

        // Récupérer l'ID courant si on est en update
        $currentId = $this->route('id');

        /*
        |--------------------------------------------------------------------------
        | Vérification conflit Classe
        |--------------------------------------------------------------------------
        */
        $classeConflit = EmploiDuTemps::where('id_classe', $this->id_classe)
            ->where('jour', $jour)
            ->when($currentId, fn($q) => $q->where('id', '!=', $currentId))
            ->where(function ($query) use ($debut, $fin) {
                $query
                    ->whereBetween('heure_debut', [$debut, $fin])
                    ->orWhereBetween('heure_fin', [$debut, $fin])
                    ->orWhere(function ($q) use ($debut, $fin) {
                        $q->where('heure_debut', '<=', $debut)
                          ->where('heure_fin', '>=', $fin);
                    });
            })
            ->exists();

        if ($classeConflit) {
            $validator->errors()->add(
                'id_classe',
                'Cette classe possède déjà un cours sur ce créneau horaire.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérification conflit Enseignant
        |--------------------------------------------------------------------------
        */
        $enseignantConflit = EmploiDuTemps::where('id_enseignant', $this->id_enseignant)
            ->where('jour', $jour)
            ->when($currentId, fn($q) => $q->where('id', '!=', $currentId))
            ->where(function ($query) use ($debut, $fin) {
                $query
                    ->whereBetween('heure_debut', [$debut, $fin])
                    ->orWhereBetween('heure_fin', [$debut, $fin])
                    ->orWhere(function ($q) use ($debut, $fin) {
                        $q->where('heure_debut', '<=', $debut)
                          ->where('heure_fin', '>=', $fin);
                    });
            })
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