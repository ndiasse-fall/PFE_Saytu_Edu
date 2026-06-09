<?php

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EnseignantController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
//Route enseignat pour saisir note
Route::middleware('check.role:ENSEIGNANT,SUPER_ADMIN,ADMIN')->group(function (): void {
    Route::post('notes/saisir', [EnseignantController::class, 'saisirNotes']);
});
