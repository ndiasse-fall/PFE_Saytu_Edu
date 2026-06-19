<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Gère la connexion des utilisateurs.
     * 
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        // Vérification des identifiants
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 422);
        }

        // Vérification si le compte est actif
        if ($user->getAttribute('actif') !== null && ! $user->actif) {
            return response()->json([
                'message' => 'Ce compte est désactivé.',
            ], 403);
        }

        // Création du token Sanctum
        $token = $user->createToken('saytou-edu-web')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => $user,
            'role' => $user->role?->value ?? $user->role,
        ]);
    }

    /**
     * Retourne les informations de l'utilisateur connecté.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    /**
     * Déconnecte l'utilisateur en supprimant son token actuel.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
