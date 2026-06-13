<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class SuperAdminController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    public function dashboard(): JsonResponse
    {
        return response()->json($this->userService->getDashboardMetrics());
    }

    public function users(): JsonResponse
    {
        return response()->json(
            User::query()
                ->latest('id')
                ->get()
        );
    }

    public function storeAdmin(StoreAdminRequest $request): JsonResponse
    {
        $admin = $this->userService->createAdmin($request->validated(), $request->user());

        return response()->json([
            'message' => 'Administrateur créé avec succès.',
            'admin' => $admin,
        ], 201);
    }

    public function updateRole(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => ['nullable', new Enum(RoleEnum::class), 'required_without:statut'],
            'statut' => ['nullable', new Enum(RoleEnum::class), 'required_without:role'],
        ]);

        $role = $request->input('role', $request->input('statut'));
        $updatedUser = $this->userService->updateUserRole($user, $role);

        return response()->json([
            'message' => 'Rôle modifié avec succès',
            'user' => $updatedUser,
        ]);
    }

    public function deleteUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->userService->deleteUser($user);

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
}