<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EmploiDuTemps::with(['classe', 'enseignant', 'matiere']);

        // Sécurité : Filtrage par rôle
        if ($user->role === 'ENSEIGNANT') {
            $query->where('id_enseignant', $user->id)->where('est_publie', true);
        } elseif ($user->role === 'ELEVE') {
            $classeIds = $user->classes()->pluck('classes.id');
            $query->whereIn('id_classe', $classeIds)->where('est_publie', true);
        }

        // Filtres dynamiques
        if ($request->filled('id_classe')) $query->where('id_classe', $request->input('id_classe'));
        if ($request->filled('id_matiere')) $query->where('id_matiere', $request->input('id_matiere'));
        if ($request->filled('jour')) $query->where('jour', $request->input('jour'));

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('jour')->orderBy('heure_debut')->get()
        ]);
    }
}