<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/run-migrations', function () {
    try {
        // Le paramètre --force est obligatoire en production
        Artisan::call('migrate', ['--force' => true]);
        return 'Les migrations ont été exécutées avec succès 🎉 !';
    } catch (\Exception $e) {
        return 'Erreur lors de la migration : ' . $e->getMessage();
    }
});
Route::get('/run-seeders', function () {
    try {
        // Le paramètre --force est obligatoire pour exécuter des seeders en production
        Artisan::call('db:seed', ['--force' => true]);
        return 'Les données de test ont été insérées avec succès 🎉 !';
    } catch (\Exception $e) {
        return 'Erreur lors du seeding : ' . $e->getMessage();
    }
});
Route::get('/', function () {
    return view('welcome');
});