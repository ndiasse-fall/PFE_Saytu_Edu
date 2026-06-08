<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterEnseignantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'                  => 'required|string|max:100',
            'prenom'               => 'required|string|max:100',
            'email'                => 'required|email|unique:utilisateurs,email',
            'mot_de_passe'         => 'required|string|min:8',
            'statut'               => 'nullable|in:actif,inactif',
            'matricule_enseignant' => 'required|string|unique:enseignants,matricule_enseignant',
            'specialite'           => 'required|string|max:100',
            'date_embauche'        => 'required|date',
        ];
    }
}
