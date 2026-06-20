<?php

namespace App\Http\Controllers\Api;

use App\Models\Matieres;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    /**
     * Liste toutes les matières.
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function index()
    {
        return Matieres::all();
    }

    /**
     * Crée une nouvelle matière.
     * 
     * @param Request $request
     * @return Matieres
     */
    public function store(Request $request)
    {
        return Matieres::create($request->all());
    }

    /**
     * Affiche les détails d'une matière spécifique.
     * 
     * @param string $id
     * @return Matieres
     */
    public function show(string $id)
    {
        return Matieres::findOrFail($id);
    }

    /**
     * Met à jour une matière.
     * 
     * @param Request $request
     * @param string $id
     * @return Matieres
     */
    public function update(Request $request, string $id)
    {
        $matiere = Matieres::findOrFail($id);

        $matiere->update($request->all());

        return $matiere;
    }

    /**
     * Supprime une matière.
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        Matieres::destroy($id);

        return response()->json([
            'message' => 'Matière supprimée'
        ]);
    }
}
