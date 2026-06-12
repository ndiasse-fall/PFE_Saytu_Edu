<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    /**
     * Liste toutes les classes.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index()
    {
        return Classe::all();
    }

    /**
     * Crée une nouvelle classe.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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
     * Affiche les détails d'une classe spécifique.
     * 
     * @param string $id
     * @return Classe
     */
    public function show(string $id)
    {
        return Classe::findOrFail($id);
    }

    /**
     * Met à jour les informations d'une classe.
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $classe = Classe::findOrFail($id);

        $classe->update($request->all());

        return response()->json($classe);
    }

    /**
     * Supprime une classe.
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
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
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
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
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
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