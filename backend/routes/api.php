<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\EmploiDuTempsController;

Route::get('/emplois-du-temps', [EmploiDuTempsController::class, 'index']);
Route::post('/emplois-du-temps', [EmploiDuTempsController::class, 'store']);
