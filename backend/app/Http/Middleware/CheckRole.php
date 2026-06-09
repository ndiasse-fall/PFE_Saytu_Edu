<?php

namespace App\Http\Middleware;

use App\Enums\RoleEnum;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return new JsonResponse([
                'message' => 'Authentification requise.',
            ], 401);
        }

        $currentRole = method_exists($user, 'resolvedRole')
            ? $user->resolvedRole()
            : ($user->role instanceof RoleEnum ? $user->role->value : (string) $user->role);

        if (! in_array($currentRole, $roles, true)) {
            return new JsonResponse([
                'message' => 'Accès refusé: rôle non autorisé.',
            ], 403);
        }

        return $next($request);
    }
}
