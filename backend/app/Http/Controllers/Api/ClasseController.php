<?php

namespace App\Http\Controllers\Api;

use App\Enums\NiveauClasseEnum;
use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class ClasseController extends Controller
{
    public function index()
    {
        return Classe::all();
    }

    public function niveaux()
    {
        return response()->json(NiveauClasseEnum::options());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_classe' => ['required', 'string', 'max:255'],
            'niveau' => ['required', Rule::in(NiveauClasseEnum::values())],
            'annee_scolaire' => ['required', 'string', 'max:20'],
        ]);

        return response()->json(Classe::create($validated), 201);
    }

    public function show(string $id)
    {
        return Classe::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $classe = Classe::findOrFail($id);
        $validated = $request->validate([
            'nom_classe' => ['sometimes', 'required', 'string', 'max:255'],
            'niveau' => ['sometimes', 'required', Rule::in(NiveauClasseEnum::values())],
            'annee_scolaire' => ['sometimes', 'required', 'string', 'max:20'],
        ]);

        $classe->update($validated);

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
