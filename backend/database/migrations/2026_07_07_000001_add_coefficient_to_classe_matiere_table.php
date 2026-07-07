<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classe_matiere', function (Blueprint $table): void {
            $table->unsignedInteger('coefficient')->default(1)->after('id_matiere');
        });
    }

    public function down(): void
    {
        Schema::table('classe_matiere', function (Blueprint $table): void {
            $table->dropColumn('coefficient');
        });
    }
};
