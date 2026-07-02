<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rules\Enum;
use App\Enums\RoleEnum;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Initialise le contrôleur avec le service utilisateur.
     */
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    /**
     * Liste les utilisateurs avec filtres (recherche, rôle, actif).
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', new Enum(RoleEnum::class)],
            'actif' => ['nullable', 'boolean'],
            'affecte' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 15);
        $users = $this->userService->listUsers($validated, $perPage);

        return response()->json($users);
    }

    public function dashboard(): JsonResponse
    {
        return response()->json($this->userService->getDashboardSummary());
    }

    /**
     * Crée un nouvel utilisateur.
     * 
     * @param StoreUserRequest $request
     * @return JsonResponse
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());
        $temporaryPassword = $user->getAttribute('temporary_password');
        $user->offsetUnset('temporary_password');

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'data' => $user,
            'temporary_password' => $temporaryPassword,
        ], 201);
    }

    /**
     * Affiche les détails d'un utilisateur.
     * 
     * @param User $user
     * @return JsonResponse
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $this->userService->showUser($user),
        ]);
    }

    /**
     * Met à jour un utilisateur existant.
     * 
     * @param UpdateUserRequest $request
     * @param User $user
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->userService->updateUser($user, $request->validated());

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'data' => $updatedUser,
        ]);
    }

    /**
     * Supprime un utilisateur (Soft Delete).
     * 
     * @param User $user
     * @return JsonResponse
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userService->deleteUser($user);

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.',
        ]);
    }

    /**
     * Active ou désactive un utilisateur.
     * 
     * @param User $user
     * @return JsonResponse
     */
    public function toggleActive(User $user): JsonResponse
    {
        $updatedUser = $this->userService->toggleActive($user);

        return response()->json([
            'message' => 'Statut utilisateur mis à jour avec succès.',
            'data' => $updatedUser,
        ]);
    }
}
