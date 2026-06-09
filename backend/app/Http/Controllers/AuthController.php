<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $identifier = trim((string) $credentials['email']);

        $user = User::query()
            ->where(function (Builder $query) use ($identifier): void {
                $query->where('email', $identifier);

                if (Schema::hasColumn('users', 'name')) {
                    $query->orWhere('name', $identifier);
                }

                if (Schema::hasColumn('users', 'prenom') && Schema::hasColumn('users', 'nom')) {
                    $fullNameSql = DB::connection()->getDriverName() === 'sqlite'
                        ? "prenom || ' ' || nom"
                        : "CONCAT(prenom, ' ', nom)";
                    $reverseFullNameSql = DB::connection()->getDriverName() === 'sqlite'
                        ? "nom || ' ' || prenom"
                        : "CONCAT(nom, ' ', prenom)";

                    $query
                        ->orWhereRaw("{$fullNameSql} = ?", [$identifier])
                        ->orWhereRaw("{$reverseFullNameSql} = ?", [$identifier]);
                }
            })
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 422);
        }

        if ($user->getAttribute('actif') !== null && ! $user->actif) {
            return response()->json([
                'message' => 'Ce compte est désactivé.',
            ], 403);
        }

        $token = $user->createToken('saytou-edu-web')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => $user,
            'role' => method_exists($user, 'resolvedRole') ? $user->resolvedRole() : ($user->role?->value ?? $user->role),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }
}
