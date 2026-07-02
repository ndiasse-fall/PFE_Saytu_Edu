<?php

namespace App\Http\Controllers\Api;

use App\Models\Matieres;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        $validated = $request->validate([
            'nom_matiere' => ['required', 'string', 'max:255', 'unique:matieres,nom_matiere'],
            'coefficient' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);

        return Matieres::create($validated);
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

        $validated = $request->validate([
            'nom_matiere' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('matieres', 'nom_matiere')->ignore($matiere->id)],
            'coefficient' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);

        $matiere->update($validated);

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
