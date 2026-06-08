<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminRequest;
use Illuminate\Http\Request;
use App\Models\User;

class SuperAdminController extends Controller
{
    /**
     * Tableau de bord Super Admin
     */
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'admins' => User::where('statut', 'ADMIN')->count(),
            'enseignants' => User::where('statut', 'ENSEIGNANT')->count(),
            'eleves' => User::where('statut', 'ELEVE')->count(),
        ]);
    }

    /**
     * Liste des utilisateurs
     */
    public function users()
    {
        return response()->json(User::all());
    }

    /**
     * Création d'un administrateur
     */
    public function storeAdmin(StoreAdminRequest $request)
    {
        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'statut' => 'ADMIN',
            'id_parent_createur' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Administrateur créé avec succès.',
            'admin' => $admin
        ], 201);
    }

    /**
     * Modifier le rôle d'un utilisateur
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE'
        ]);

        $user->update([
            'statut' => $request->statut
        ]);

        return response()->json([
            'message' => 'Rôle modifié avec succès',
            'user' => $user
        ]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}