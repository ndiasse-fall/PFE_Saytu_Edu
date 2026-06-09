<?php

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