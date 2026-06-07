<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\RegisterEnseignantRequest;
use App\Http\Requests\RegisterEleveRequest;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ───── ENSEIGNANTS ─────

    public function indexEnseignants()
    {
        return response()->json(User::where('statut', 'ENSEIGNANT')->get(), 200);
    }

    public function storeEnseignant(RegisterEnseignantRequest $request)
    {
        $enseignant = User::create([
            'name'                 => $request->nom . ' ' . $request->prenom,
            'email'                => $request->email,
            'password'             => Hash::make($request->mot_de_passe),
            'statut'               => 'ENSEIGNANT',
            'matricule_enseignant' => $request->matricule_enseignant,
            'specialite'           => $request->specialite,
            'date_embauche'        => $request->date_embauche,
        ]);

        return response()->json($enseignant, 201);
    }

    public function updateEnseignant(RegisterEnseignantRequest $request, $id)
    {
        $enseignant = User::where('statut', 'ENSEIGNANT')->findOrFail($id);
        $data = $request->validated();

        if (isset($data['mot_de_passe'])) {
            $data['password'] = Hash::make($data['mot_de_passe']);
            unset($data['mot_de_passe']);
        }

        $enseignant->update($data);
        return response()->json($enseignant, 200);
    }

    public function destroyEnseignant($id)
    {
        User::where('statut', 'ENSEIGNANT')->findOrFail($id)->delete();
        return response()->json(['message' => 'Enseignant supprimé'], 200);
    }

    // ───── ÉLÈVES ─────

    public function indexEleves()
    {
        return response()->json(User::where('statut', 'ELEVE')->get(), 200);
    }

    public function storeEleve(RegisterEleveRequest $request)
    {
        $eleve = User::create([
            'name'             => $request->nom . ' ' . $request->prenom,
            'email'            => $request->email,
            'password'         => Hash::make($request->mot_de_passe),
            'statut'           => 'ELEVE',
            'matricule_eleve'  => $request->matricule_eleve,
            'date_naissance'   => $request->date_naissance,
            'adresse'          => $request->adresse,
            'telephone_parent' => $request->telephone_parent,
        ]);

        return response()->json($eleve, 201);
    }

    public function updateEleve(RegisterEleveRequest $request, $id)
    {
        $eleve = User::where('statut', 'ELEVE')->findOrFail($id);
        $data = $request->validated();

        if (isset($data['mot_de_passe'])) {
            $data['password'] = Hash::make($data['mot_de_passe']);
            unset($data['mot_de_passe']);
        }

        $eleve->update($data);
        return response()->json($eleve, 200);
    }

    public function destroyEleve($id)
    {
        User::where('statut', 'ELEVE')->findOrFail($id)->delete();
        return response()->json(['message' => 'Élève supprimé'], 200);
    }
}
