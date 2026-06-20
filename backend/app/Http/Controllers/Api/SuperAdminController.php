<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminRequest;
use App\Models\User;
use App\Events\UserCreated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    /**
     * Affiche les statistiques globales sur le tableau de bord.
     * 
     * @return JsonResponse
     */
    public function dashboard()
    {
        return response()->json([
            'total_users' => User::count(),
            'admins' => User::where('role', 'ADMIN')->count(),
            'enseignants' => User::where('role', 'ENSEIGNANT')->count(),
            'eleves' => User::where('role', 'ELEVE')->count(),
        ]);
    }

    /**
     * Liste tous les utilisateurs du système.
     * 
     * @return JsonResponse
     */
    public function users()
    {
        return response()->json(User::all());
    }

    /**
     * Crée un nouvel utilisateur avec le rôle ADMIN.
     * 
     * @param StoreAdminRequest $request
     * @return JsonResponse
     */
    public function storeAdmin(StoreAdminRequest $request)
    {
        $admin = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'statut' => 'ADMIN',
            'role' => 'ADMIN',
            'id_parent_createur' => $request->user()->id,
        ]);

        event(new UserCreated($admin, $request->password));

        return response()->json([
            'message' => 'Administrateur créé avec succès.',
            'admin' => $admin
        ], 201);
    }

    /**
     * Modifie le rôle (ou statut) d'un utilisateur.
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateRole(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'statut' => 'required|in:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE'
        ]);

        $user->update([
            'statut' => $request->statut,
            'role' => $request->statut // Assure la cohérence entre statut et role
        ]);

        return response()->json([
            'message' => 'Rôle modifié avec succès',
            'user' => $user
        ]);
    }

    /**
     * Supprime définitivement un utilisateur du système.
     * 
     * @param string $id
     * @return JsonResponse
     */
    public function deleteUser(string $id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}
