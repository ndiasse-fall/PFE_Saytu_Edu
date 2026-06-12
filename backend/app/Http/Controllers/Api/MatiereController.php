<?php

namespace App\Http\Controllers\Api;

use App\Models\Matiere;
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
        return Matiere::all();
    }

    /**
     * Crée une nouvelle matière.
     * 
     * @param Request $request
     * @return Matiere
     */
    public function store(Request $request)
    {
        return Matiere::create($request->all());
    }

    /**
     * Affiche les détails d'une matière spécifique.
     * 
     * @param string $id
     * @return Matiere
     */
    public function show(string $id)
    {
        return Matiere::findOrFail($id);
    }

    /**
     * Met à jour une matière.
     * 
     * @param Request $request
     * @param string $id
     * @return Matiere
     */
    public function update(Request $request, string $id)
    {
        $matiere = Matiere::findOrFail($id);

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
        Matiere::destroy($id);

        return response()->json([
            'message' => 'Matière supprimée'
        ]);
    }
}
