<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClasseController extends Controller
{
    public function index()
    {
        return Classe::all();
    }

    public function store(Request $request)
    {
        $classe = Classe::create([
            'nom_classe' => $request->nom_classe,
            'niveau' => $request->niveau,
            'annee_scolaire' => $request->annee_scolaire,
        ]);

        return response()->json($classe, 201);
    }

    public function show(string $id)
    {
        return Classe::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $classe = Classe::findOrFail($id);
        $classe->update($request->all());

        return response()->json($classe);
    }

    public function destroy(string $id)
    {
        Classe::destroy($id);

        return response()->json(['message' => 'Classe supprimée']);
    }

    public function inscrireEleve(Request $request, $id)
    {
        try {
            $request->validate(['id_eleve' => 'required|exists:users,id']);
            $classe = Classe::findOrFail($id);
            $classe->eleves()->syncWithoutDetaching([$request->id_eleve]);

            return response()->json(['message' => 'Élève inscrit avec succès']);
        } catch (\Exception $e) {
            Log::error("Erreur inscription élève : " . $e->getMessage());

            return response()->json([
                'message' => "Erreur lors de l'inscription",
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function affecterEnseignant(Request $request, $id)
    {
        $classe = Classe::findOrFail($id);
        $classe->enseignants()->syncWithoutDetaching([$request->id_enseignant]);

        return response()->json(['message' => 'Enseignant affecté avec succès']);
    }

    public function mesClasses(Request $request)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return response()->json(Classe::all());
        }

        $classes = $user->enseignantClasses()
            ->select('classes.id', 'classes.nom_classe', 'classes.niveau', 'classes.annee_scolaire')
            ->get();

        return response()->json($classes);
    }

    public function elevesParClasse(Request $request, $id)
    {
        $user = $request->user();
        $role = $user?->resolvedRole();

        if (in_array($role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            $classe = Classe::findOrFail($id);
        } else {
            $classe = $user->enseignantClasses()->where('classes.id', $id)->first();

            if (! $classe) {
                return response()->json(['message' => 'Classe non autorisée'], 403);
            }
        }

        $eleves = $classe->eleves()
            ->select('users.id', 'users.nom', 'users.prenom', 'users.email')
            ->orderBy('prenom')
            ->orderBy('nom')
            ->get();

        return response()->json($eleves);
    }
}
