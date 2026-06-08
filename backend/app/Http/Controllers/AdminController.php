<?php

namespace App\Http\Controllers;

use App\Models\Enseignant;
use App\Models\Eleve;
use App\Http\Requests\RegisterEnseignantRequest;
use App\Http\Requests\RegisterEleveRequest;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ───── ENSEIGNANTS ─────

    public function indexEnseignants()
    {
        return response()->json(Enseignant::all(), 200);
    }

    public function storeEnseignant(RegisterEnseignantRequest $request)
    {
        $enseignant = Enseignant::create([
            'nom'                  => $request->nom,
            'prenom'               => $request->prenom,
            'email'                => $request->email,
            'mot_de_passe'         => Hash::make($request->mot_de_passe),
            'statut'               => $request->statut ?? 'actif',
            'matricule_enseignant' => $request->matricule_enseignant,
            'specialite'           => $request->specialite,
            'date_embauche'        => $request->date_embauche,
        ]);

        return response()->json($enseignant, 201);
    }

    public function updateEnseignant(RegisterEnseignantRequest $request, $id)
    {
        $enseignant = Enseignant::findOrFail($id);
        $data = $request->validated();

        if (isset($data['mot_de_passe'])) {
            $data['mot_de_passe'] = Hash::make($data['mot_de_passe']);
        }

        $enseignant->update($data);
        return response()->json($enseignant, 200);
    }

    public function destroyEnseignant($id)
    {
        Enseignant::findOrFail($id)->delete();
        return response()->json(['message' => 'Enseignant supprimé'], 200);
    }

    // ───── ÉLÈVES ─────

    public function indexEleves()
    {
        return response()->json(Eleve::all(), 200);
    }

    public function storeEleve(RegisterEleveRequest $request)
    {
        $eleve = Eleve::create([
            'nom'              => $request->nom,
            'prenom'           => $request->prenom,
            'email'            => $request->email,
            'mot_de_passe'     => Hash::make($request->mot_de_passe),
            'statut'           => $request->statut ?? 'actif',
            'matricule_eleve'  => $request->matricule_eleve,
            'date_naissance'   => $request->date_naissance,
            'adresse'          => $request->adresse,
            'telephone_parent' => $request->telephone_parent,
        ]);

        return response()->json($eleve, 201);
    }

    public function updateEleve(RegisterEleveRequest $request, $id)
    {
        $eleve = Eleve::findOrFail($id);
        $data = $request->validated();

        if (isset($data['mot_de_passe'])) {
            $data['mot_de_passe'] = Hash::make($data['mot_de_passe']);
        }

        $eleve->update($data);
        return response()->json($eleve, 200);
    }

    public function destroyEleve($id)
    {
        Eleve::findOrFail($id)->delete();
        return response()->json(['message' => 'Élève supprimé'], 200);
    }
}
