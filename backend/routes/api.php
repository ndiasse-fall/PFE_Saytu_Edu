<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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