<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SuperAdminController;

<<<<<<< HEAD
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

   Route::prefix('superadmin')->group(function () {

    Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);

    Route::get('/users', [SuperAdminController::class, 'users']);

    Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);

    Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);

    Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
});
});
=======
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;

// Routes CRUD Classes
Route::apiResource('classes', ClasseController::class);

// Routes d'affectation
Route::post(
    'classes/{id}/inscrire-eleve',
    [ClasseController::class, 'inscrireEleve']
);

Route::post(
    'classes/{id}/affecter-enseignant',
    [ClasseController::class, 'affecterEnseignant']
);

// Routes CRUD Matières
Route::apiResource('matieres', MatiereController::class);
>>>>>>> af179431315b96e83c314dbeea19868caf11ab0f
