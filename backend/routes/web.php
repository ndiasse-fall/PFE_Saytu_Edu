<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/run-setup', function () {
    try {
        // Exécute les migrations
        Artisan::call('migrate', ['--force' => true]);
        // Exécute les seeders (données de test)
        Artisan::call('db:seed', ['--force' => true]);

        return 'Migrations et Seeders exécutés avec succès 🎉 !';
    } catch (\Exception $e) {
        return 'Erreur : ' . $e->getMessage();
    }
});
Route::get('/', function () {
    return view('welcome');
});