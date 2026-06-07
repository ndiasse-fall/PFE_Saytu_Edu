<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterEleveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'              => 'required|string|max:100',
            'prenom'           => 'required|string|max:100',
            'email'            => 'required|email|unique:utilisateurs,email',
            'mot_de_passe'     => 'required|string|min:8',
            'statut'           => 'nullable|in:actif,inactif',
            'matricule_eleve'  => 'required|string|unique:eleves,matricule_eleve',
            'date_naissance'   => 'required|date',
            'adresse'          => 'nullable|string|max:255',
            'telephone_parent' => 'nullable|string|max:20',
        ];
    }
}
