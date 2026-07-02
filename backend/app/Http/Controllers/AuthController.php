<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
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
        $resolvedRole = $user->role?->value ?? $user->role ?? $user->statut;
        $normalizedUser = $user->toArray();
        $normalizedUser['role'] = $resolvedRole;
        $normalizedUser['statut'] = $user->statut ?? $resolvedRole;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => $normalizedUser,
            'role' => $resolvedRole,
            'must_change_password' => (bool) $user->must_change_password,
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors' => [
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ],
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'must_change_password' => false,
        ])->save();

        return response()->json([
            'message' => 'Mot de passe modifié avec succès.',
            'user' => $user->fresh(),
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
        $user = $request->user();
        $resolvedRole = $user->role?->value ?? $user->role ?? $user->statut;
        $normalizedUser = $user->toArray();
        $normalizedUser['role'] = $resolvedRole;
        $normalizedUser['statut'] = $user->statut ?? $resolvedRole;

        return response()->json([
            'data' => $normalizedUser,
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill($request->validated())->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'data' => $user->fresh(),
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
