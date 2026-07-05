<?php

namespace App\Http\Controllers\Api;

use App\Enums\NiveauClasseEnum;
use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Database\QueryException;
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
            'niveau' => ['required', Rule::in(NiveauClasseEnum::values())],
            'annee_scolaire' => ['required', 'string', 'max:20'],
            'nom_classe' => [
                'required',
                'string',
                'max:255',
                Rule::unique('classes', 'nom_classe')
                    ->where(fn ($query) => $query->where('annee_scolaire', $request->input('annee_scolaire'))),
            ],
        ]);

        try {
            return response()->json(Classe::create($validated), 201);
        } catch (QueryException $exception) {
            if ($this->isDuplicateClassConstraint($exception)) {
                return response()->json([
                    'message' => 'Cette classe existe déjà pour cette année scolaire.',
                ], 422);
            }

            throw $exception;
        }
    }

    public function show(string $id)
    {
        return Classe::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $classe = Classe::findOrFail($id);
        $validated = $request->validate([
            'nom_classe' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('classes', 'nom_classe')
                    ->where(fn ($query) => $query->where('annee_scolaire', $request->input('annee_scolaire', $classe->annee_scolaire)))
                    ->ignore($classe->id),
            ],
            'niveau' => ['sometimes', 'required', Rule::in(NiveauClasseEnum::values())],
            'annee_scolaire' => ['sometimes', 'required', 'string', 'max:20'],
        ]);

        try {
            $classe->update($validated);
        } catch (QueryException $exception) {
            if ($this->isDuplicateClassConstraint($exception)) {
                return response()->json([
                    'message' => 'Cette classe existe déjà pour cette année scolaire.',
                ], 422);
            }

            throw $exception;
        }

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

    private function isDuplicateClassConstraint(QueryException $exception): bool
    {
        return str_contains($exception->getMessage(), 'classes_nom_classe_annee_scolaire_unique');
    }
}
