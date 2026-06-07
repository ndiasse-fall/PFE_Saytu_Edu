<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckStatut
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->actif) {
            $user->currentAccessToken()?->delete();

            return new JsonResponse([
                'message' => 'Accès refusé: utilisateur inactif.',
            ], 403);
        }

        return $next($request);
    }
}
