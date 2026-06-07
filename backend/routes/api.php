<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\AdminController;

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

// Routes CRUD Classes
Route::apiResource('classes', ClasseController::class);
Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);

// Routes CRUD Matières
Route::apiResource('matieres', MatiereController::class);

// Routes CRUD Enseignants
Route::get('/enseignants',         [AdminController::class, 'indexEnseignants']);
Route::post('/enseignants',        [AdminController::class, 'storeEnseignant']);
Route::put('/enseignants/{id}',    [AdminController::class, 'updateEnseignant']);
Route::delete('/enseignants/{id}', [AdminController::class, 'destroyEnseignant']);

// Routes CRUD Élèves
Route::get('/eleves',         [AdminController::class, 'indexEleves']);
Route::post('/eleves',        [AdminController::class, 'storeEleve']);
Route::put('/eleves/{id}',    [AdminController::class, 'updateEleve']);
Route::delete('/eleves/{id}', [AdminController::class, 'destroyEleve']);
