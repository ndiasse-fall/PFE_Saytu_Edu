<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\Api\EleveController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\BulletinController;
// --- ROUTES PUBLIQUES ---
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);

// --- ROUTES PROTÉGÉES ---
Route::middleware(['auth:sanctum', 'check.statut'])->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::patch('me', [AuthController::class, 'updateProfile']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | SUPER ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:SUPER_ADMIN')->group(function (): void {

        Route::prefix('superadmin')->group(function (): void {

            Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
            Route::get('/users', [SuperAdminController::class, 'users']);

            Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);

            Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);

            Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN + SUPER ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {

        Route::get('dashboard/users-summary', [UserController::class, 'dashboard']);

        Route::apiResource('users', UserController::class)
            ->except(['index', 'show']);

        Route::patch(
            'users/{user}/toggle-active',
            [UserController::class, 'toggleActive']
        );

        Route::apiResource('classes', ClasseController::class)
            ->except(['index', 'show']);

        Route::post(
            'classes/{id}/inscrire-eleve',
            [ClasseController::class, 'inscrireEleve']
        );

    // Bulletins
    Route::apiResource('matieres', MatiereController::class);

        Route::get('bulletins', [BulletinController::class, 'index']);
        Route::get('bulletins/{id}', [BulletinController::class, 'show']);
        Route::post('bulletins', [BulletinController::class, 'store']);
        Route::put('bulletins/{id}', [BulletinController::class, 'update']);
        Route::delete('bulletins/{id}', [BulletinController::class, 'destroy']);

        // Écriture Emploi du Temps
        Route::post('emplois-du-temps/publier', [EmploiDuTempsController::class, 'publier']);
        Route::apiResource('emplois-du-temps', EmploiDuTempsController::class)
            ->except(['index', 'show']);

        Route::apiResource('matieres', MatiereController::class)
            ->except(['index', 'show']);

        /*
        |--------------------------------------------------------------------------
        | ABSENCES
        |--------------------------------------------------------------------------
        */
        Route::post('absences', [AbsenceController::class, 'store']);

        Route::put(
            'absences/{id}',
            [AbsenceController::class, 'update']
        );

        Route::delete(
            'absences/{id}',
            [AbsenceController::class, 'destroy']
        );
    });

    /*
    |--------------------------------------------------------------------------
    | LECTURE ADMIN + SUPER ADMIN + ENSEIGNANT
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:SUPER_ADMIN,ADMIN,ENSEIGNANT')
        ->group(function (): void {

            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{user}', [UserController::class, 'show']);

            Route::get('classes', [ClasseController::class, 'index']);
            Route::get('classes/{id}', [ClasseController::class, 'show']);

            Route::get('matieres', [MatiereController::class, 'index']);
            Route::get('matieres/{id}', [MatiereController::class, 'show']);

            Route::get(
                'notes/resultats/classe/{id}',
                [NoteController::class, 'resultatsParClasse']
            );
        });

    /*
    |--------------------------------------------------------------------------
    | TOUS LES RÔLES
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE')
        ->group(function (): void {

            Route::get('notes', [NoteController::class, 'index']);

            Route::get(
                'notes/{id}',
                [NoteController::class, 'show']
            );

            Route::get(
                'notes/resultats/eleve/{id}',
                [NoteController::class, 'resultatsParEleve']
            );

            Route::get(
                'emplois-du-temps',
                [EmploiDuTempsController::class, 'index']
            );

            Route::get(
                'emplois-du-temps/{id}',
                [EmploiDuTempsController::class, 'show']
            );

            Route::get('absences', [AbsenceController::class, 'index']);

            Route::get(
                'absences/{id}',
                [AbsenceController::class, 'show']
            );
        });

    /*
    |--------------------------------------------------------------------------
    | ENSEIGNANT + ADMIN + SUPER ADMIN
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:ENSEIGNANT,ADMIN,SUPER_ADMIN')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | NOTES
            |--------------------------------------------------------------------------
            */
            Route::post('notes', [NoteController::class, 'store']);
            Route::post('notes/saisir', [NoteController::class, 'store']);

            Route::put(
                'notes/{id}',
                [NoteController::class, 'update']
            );

            Route::delete(
                'notes/{id}',
                [NoteController::class, 'destroy']
            );

            /*
            |--------------------------------------------------------------------------
            | NOUVELLES ROUTES ENSEIGNANT
            |--------------------------------------------------------------------------
            */

            Route::get(
                'mes-classes',
                [ClasseController::class, 'mesClasses']
            );

            Route::get(
                'mes-classes/{id}/eleves',
                [ClasseController::class, 'elevesParClasse']
            );
        });

    /*
    |--------------------------------------------------------------------------
    | ELEVE
    |--------------------------------------------------------------------------
    */
    Route::middleware('check.role:ELEVE')->group(function () {

        Route::get(
            'mon-bulletin',
            [EleveController::class, 'monBulletin']
        );

        Route::get(
            'mon-emploi-du-temps',
            [EleveController::class, 'monEmploiDuTemps']
        );
    });
});