<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isSuperAdministrateur();
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255|required_without_all:nom,prenom',
            'nom' => 'nullable|string|max:255|required_without:name',
            'prenom' => 'nullable|string|max:255|required_without:name',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string',
        ];
    }
}
