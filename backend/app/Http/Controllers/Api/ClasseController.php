<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Classe::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $classe = Classe::create([
            'nom_classe' => $request->nom_classe,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
        ]);

        return response()->json($classe, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Classe::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $classe = Classe::findOrFail($id);

        $classe->update($request->all());

        return response()->json($classe);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Classe::destroy($id);

        return response()->json([
            'message' => 'Classe supprimée'
        ]);
    }

    /**
     * Inscrire un élève dans une classe.
     */
    public function inscrireEleve(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);

        $classe->eleves()->syncWithoutDetaching([
            $request->id_eleve
        ]);

        return response()->json([
            'message' => 'Élève inscrit avec succès'
        ]);
    }

    /**
     * Affecter un enseignant à une classe.
     */
    public function affecterEnseignant(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);

        $classe->enseignants()->syncWithoutDetaching([
            $request->id_enseignant
        ]);

        return response()->json([
            'message' => 'Enseignant affecté avec succès'
        ]);
    }
 }