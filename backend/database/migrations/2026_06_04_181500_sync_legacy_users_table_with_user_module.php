<?php

use App\Enums\RoleEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasNom = Schema::hasColumn('users', 'nom');
        $hasPrenom = Schema::hasColumn('users', 'prenom');
        $hasTelephone = Schema::hasColumn('users', 'telephone');
        $hasAdresse = Schema::hasColumn('users', 'adresse');
        $hasRole = Schema::hasColumn('users', 'role');
        $hasActif = Schema::hasColumn('users', 'actif');
        $hasDeletedAt = Schema::hasColumn('users', 'deleted_at');

        Schema::table('users', function (Blueprint $table) use (
            $hasNom,
            $hasPrenom,
            $hasTelephone,
            $hasAdresse,
            $hasRole,
            $hasActif,
            $hasDeletedAt,
        ): void {
            if (! $hasNom) {
                $table->string('nom')->default('')->after('id');
            }

            if (! $hasPrenom) {
                $table->string('prenom')->default('')->after('nom');
            }

            if (! $hasTelephone) {
                $table->string('telephone')->nullable()->after('password');
            }

            if (! $hasAdresse) {
                $table->text('adresse')->nullable()->after('telephone');
            }

            if (! $hasRole) {
                $table->string('role')->default(RoleEnum::ELEVE->value)->after('adresse');
            }

            if (! $hasActif) {
                $table->boolean('actif')->default(true)->after('role');
            }

            if (! $hasDeletedAt) {
                $table->softDeletes();
            }
        });

        if (Schema::hasColumn('users', 'name')) {
            DB::table('users')
                ->where('nom', '')
                ->update([
                    'nom' => DB::raw('name'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'deleted_at')) {
                $table->dropSoftDeletes();
            }

            $columns = collect(['actif', 'role', 'adresse', 'telephone', 'prenom', 'nom'])
                ->filter(fn (string $column): bool => Schema::hasColumn('users', $column))
                ->all();

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
