# Guide de création des modules backend

Ce document explique comment ajouter un module au backend Laravel de Saytu Edu.
Il sert de convention commune pour éviter les routes incomplètes, les contrôleurs
sans validation, les problèmes de rôles et les fonctionnalités non testées.

## 1. Architecture actuelle

Le backend se trouve dans `backend/`.

```text
backend/
├── app/
│   ├── Enums/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Services/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── tests/
    ├── Feature/
    └── Unit/
```

Un module métier complet doit généralement contenir :

1. une migration ;
2. un modèle Eloquent ;
3. une factory ;
4. une ou plusieurs Form Requests ;
5. un service si la logique métier est importante ;
6. un contrôleur ;
7. des routes protégées ;
8. des relations dans les autres modèles ;
9. des tests Feature ;
10. des tests Unit pour le service.

## 2. Convention recommandée

Pour les nouveaux modules, utiliser les conventions suivantes :

| Élément | Convention | Exemple |
|---|---|---|
| Modèle | singulier, PascalCase | `Absence.php` |
| Contrôleur | nom du modèle + `Controller` | `AbsenceController.php` |
| Service | nom du modèle + `Service` | `AbsenceService.php` |
| Form Request création | `Store` + modèle + `Request` | `StoreAbsenceRequest.php` |
| Form Request modification | `Update` + modèle + `Request` | `UpdateAbsenceRequest.php` |
| Factory | nom du modèle + `Factory` | `AbsenceFactory.php` |
| Test API | nom du modèle + `ApiTest` | `AbsenceApiTest.php` |
| Table SQL | pluriel, snake_case | `absences` |
| URL API | pluriel, kebab-case | `/api/absences` |

Utiliser `App\Http\Controllers\Api` pour tous les nouveaux contrôleurs API afin
de garder une structure homogène.

Attention aux fichiers existants :

- `app/Models/classe.php` devrait à terme être renommé `Classe.php` ;
- `app/Models/Matieres.php` fait doublon avec `Matiere.php` ;
- `app/Services/bulleetin.php` fait doublon avec `BulletinService.php`.

Ne pas reproduire ces anomalies dans les nouveaux modules.

## 3. Ordre de création d’un module

Depuis le dossier `backend`, exécuter les commandes suivantes.

Exemple pour un module `Absence` :

```powershell
php artisan make:model Absence -mf
php artisan make:request StoreAbsenceRequest
php artisan make:request UpdateAbsenceRequest
php artisan make:controller Api/AbsenceController --api
php artisan make:class Services/AbsenceService
php artisan make:test AbsenceApiTest
php artisan make:test AbsenceServiceTest --unit
```

Si le modèle ou certains fichiers existent déjà, ne pas les recréer. Vérifier :

```powershell
Get-ChildItem app\Models
Get-ChildItem app\Http\Requests
Get-ChildItem database\migrations
```

## 4. Fichier 1 : migration

Emplacement :

```text
backend/database/migrations/YYYY_MM_DD_HHMMSS_create_absences_table.php
```

La migration décrit la structure SQL et les contraintes.

Exemple :

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table): void {
            $table->id();
            $table->date('date_absence');
            $table->string('motif')->nullable();
            $table->boolean('est_justifiee')->default(false);
            $table->foreignId('id_eleve')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('id_classe')
                ->nullable()
                ->constrained('classes')
                ->nullOnDelete();
            $table->foreignId('id_enseignant')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->unique(
                ['date_absence', 'id_eleve', 'id_classe'],
                'absences_date_eleve_classe_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
```

### Règles pour les migrations

- toujours ajouter les clés étrangères ;
- choisir explicitement le comportement de suppression ;
- ajouter un index ou une contrainte unique pour les recherches fréquentes ;
- rendre `nullable` uniquement ce qui est réellement facultatif ;
- ne jamais modifier une ancienne migration déjà utilisée en production ;
- créer une nouvelle migration pour faire évoluer une table existante.

Après création :

```powershell
php artisan migrate
php artisan migrate:status
```

Pour tester toutes les migrations depuis zéro :

```powershell
php artisan migrate:fresh --seed
```

Cette dernière commande efface les données locales.

## 5. Fichier 2 : modèle

Emplacement :

```text
backend/app/Models/Absence.php
```

Le modèle définit les champs modifiables, les casts et les relations.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_absence',
        'motif',
        'est_justifiee',
        'id_eleve',
        'id_classe',
        'id_enseignant',
    ];

    protected function casts(): array
    {
        return [
            'date_absence' => 'date',
            'est_justifiee' => 'boolean',
        ];
    }

    public function eleve(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_eleve');
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class, 'id_classe');
    }

    public function enseignant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_enseignant');
    }
}
```

### Relations inverses

Dans `app/Models/User.php` :

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

public function absences(): HasMany
{
    return $this->hasMany(Absence::class, 'id_eleve');
}

public function absencesSaisies(): HasMany
{
    return $this->hasMany(Absence::class, 'id_enseignant');
}
```

Dans `app/Models/Classe.php` :

```php
use Illuminate\Database\Eloquent\Relations\HasMany;

public function absences(): HasMany
{
    return $this->hasMany(Absence::class, 'id_classe');
}
```

## 6. Fichier 3 : factory

Emplacement :

```text
backend/database/factories/AbsenceFactory.php
```

Une factory permet de créer rapidement des données réalistes dans les tests.

```php
<?php

namespace Database\Factories;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AbsenceFactory extends Factory
{
    protected $model = Absence::class;

    public function definition(): array
    {
        return [
            'date_absence' => fake()->date(),
            'motif' => fake()->optional()->sentence(),
            'est_justifiee' => false,
            'id_eleve' => User::factory()->eleve(),
            'id_classe' => Classe::factory(),
            'id_enseignant' => User::factory()->enseignant(),
        ];
    }

    public function justifiee(): static
    {
        return $this->state(fn (): array => [
            'est_justifiee' => true,
            'motif' => 'Certificat médical',
        ]);
    }
}
```

Une factory doit produire une ligne valide sans configuration supplémentaire.

## 7. Fichier 4 : validation de création

Emplacement :

```text
backend/app/Http/Requests/StoreAbsenceRequest.php
```

La Form Request doit valider la structure des données. Les autorisations métier
complexes restent dans le service.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'date_absence' => ['required', 'date', 'before_or_equal:today'],
            'id_classe' => ['required', 'integer', 'exists:classes,id'],
            'absents' => ['required', 'array', 'min:1'],
            'absents.*' => ['integer', 'distinct', 'exists:users,id'],
            'motif' => ['nullable', 'string', 'max:255'],
        ];
    }
}
```

Ne jamais utiliser directement `$request->all()` dans le contrôleur. Utiliser :

```php
$request->validated();
```

## 8. Fichier 5 : validation de modification

Emplacement :

```text
backend/app/Http/Requests/UpdateAbsenceRequest.php
```

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAbsenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'motif' => ['sometimes', 'nullable', 'string', 'max:255'],
            'est_justifiee' => ['sometimes', 'boolean'],
        ];
    }
}
```

Pour une modification, utiliser `sometimes` afin de permettre un payload
partiel.

## 9. Fichier 6 : service métier

Emplacement :

```text
backend/app/Services/AbsenceService.php
```

Le service porte les règles métier :

- vérifier l’affectation de l’enseignant ;
- vérifier l’inscription des élèves ;
- éviter les doublons ;
- créer plusieurs absences dans une transaction ;
- filtrer les résultats selon le rôle.

```php
<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AbsenceService
{
    public function createMany(User $actor, array $data): Collection
    {
        $classe = Classe::query()
            ->with(['enseignants', 'eleves'])
            ->findOrFail($data['id_classe']);

        if (! $classe->enseignants->contains($actor->id)) {
            abort(403, 'Vous n’êtes pas affecté à cette classe.');
        }

        $invalidIds = collect($data['absents'])
            ->reject(fn (int $id): bool => $classe->eleves->contains($id))
            ->values();

        if ($invalidIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'absents' => 'Certains élèves ne sont pas inscrits dans cette classe.',
            ]);
        }

        return DB::transaction(function () use ($actor, $classe, $data): Collection {
            return collect($data['absents'])
                ->map(function (int $eleveId) use ($actor, $classe, $data): Absence {
                    return Absence::query()->updateOrCreate(
                        [
                            'date_absence' => $data['date_absence'],
                            'id_eleve' => $eleveId,
                            'id_classe' => $classe->id,
                        ],
                        [
                            'motif' => $data['motif'] ?? null,
                            'id_enseignant' => $actor->id,
                        ]
                    );
                });
        });
    }

    public function listFor(User $actor, array $filters = [])
    {
        $query = Absence::query()
            ->with(['eleve', 'classe', 'enseignant'])
            ->when(
                $filters['date'] ?? null,
                fn ($query, string $date) => $query->whereDate('date_absence', $date)
            )
            ->when(
                $filters['id_classe'] ?? null,
                fn ($query, int $classeId) => $query->where('id_classe', $classeId)
            );

        if ($actor->isEleve()) {
            $query->where('id_eleve', $actor->id);
        }

        if ($actor->isEnseignant()) {
            $query->whereHas(
                'classe.enseignants',
                fn ($query) => $query->where('users.id', $actor->id)
            );
        }

        return $query->latest('date_absence')->paginate(20);
    }

    public function update(Absence $absence, array $data): Absence
    {
        $absence->update($data);

        return $absence->fresh(['eleve', 'classe', 'enseignant']);
    }

    public function delete(Absence $absence): void
    {
        $absence->delete();
    }
}
```

### Quand créer un service ?

Créer un service si au moins une condition est vraie :

- plusieurs modèles sont utilisés ;
- une transaction est nécessaire ;
- la même logique sera appelée par plusieurs contrôleurs ;
- il existe des règles d’autorisation métier ;
- le traitement doit avoir des tests Unit.

Pour un CRUD très simple, le contrôleur peut utiliser directement le modèle.

## 10. Fichier 7 : contrôleur

Emplacement :

```text
backend/app/Http/Controllers/Api/AbsenceController.php
```

Le contrôleur doit rester court. Il reçoit la requête, appelle le service et
retourne une réponse JSON.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use App\Models\Absence;
use App\Services\AbsenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function __construct(
        private readonly AbsenceService $absenceService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date'],
            'id_classe' => ['nullable', 'integer', 'exists:classes,id'],
        ]);

        return response()->json(
            $this->absenceService->listFor($request->user(), $filters)
        );
    }

    public function store(StoreAbsenceRequest $request): JsonResponse
    {
        $absences = $this->absenceService->createMany(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Absences enregistrées avec succès.',
            'data' => $absences,
        ], 201);
    }

    public function show(Request $request, Absence $absence): JsonResponse
    {
        // Ajouter ici une Policy ou une vérification de visibilité.
        return response()->json([
            'data' => $absence->load(['eleve', 'classe', 'enseignant']),
        ]);
    }

    public function update(
        UpdateAbsenceRequest $request,
        Absence $absence
    ): JsonResponse {
        return response()->json([
            'message' => 'Absence mise à jour avec succès.',
            'data' => $this->absenceService->update(
                $absence,
                $request->validated()
            ),
        ]);
    }

    public function destroy(Absence $absence): JsonResponse
    {
        $this->absenceService->delete($absence);

        return response()->json([
            'message' => 'Absence supprimée avec succès.',
        ]);
    }
}
```

### Format JSON recommandé

Création :

```json
{
  "message": "Ressource créée avec succès.",
  "data": {}
}
```

Liste paginée :

```json
{
  "current_page": 1,
  "data": [],
  "last_page": 1,
  "per_page": 20,
  "total": 0
}
```

Erreur de validation Laravel :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "champ": ["Message d’erreur."]
  }
}
```

## 11. Fichier 8 : routes API

Emplacement :

```text
backend/routes/api.php
```

Ajouter l’import une seule fois :

```php
use App\Http\Controllers\Api\AbsenceController;
```

Placer les routes dans les groupes de rôles adaptés :

```php
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {
    Route::middleware(
        'check.role:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE'
    )->group(function (): void {
        Route::get('absences', [AbsenceController::class, 'index']);
        Route::get('absences/{absence}', [AbsenceController::class, 'show']);
    });

    Route::middleware('check.role:ENSEIGNANT')->group(function (): void {
        Route::post('absences', [AbsenceController::class, 'store']);
    });

    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {
        Route::put('absences/{absence}', [AbsenceController::class, 'update']);
        Route::delete('absences/{absence}', [AbsenceController::class, 'destroy']);
    });
});
```

### Matrice de permissions

Avant de coder un module, écrire une matrice :

| Action | Super Admin | Admin | Enseignant | Élève |
|---|---:|---:|---:|---:|
| Lister les absences autorisées | Oui | Oui | Oui | Oui |
| Voir une absence autorisée | Oui | Oui | Oui | Oui |
| Saisir une absence | Non | Non | Oui | Non |
| Justifier une absence | Oui | Oui | Non | Non |
| Supprimer une absence | Oui | Oui | Non | Non |

Le middleware contrôle le rôle global. Le service ou une Policy contrôle la
propriété de la ressource.

Exemple : un enseignant ne doit pas voir les absences d’une classe à laquelle
il n’est pas affecté, même si son rôle est autorisé sur la route.

Après modification :

```powershell
php artisan route:list --path=api
php artisan route:cache
php artisan route:clear
```

## 12. Fichier 9 : tests Feature

Emplacement :

```text
backend/tests/Feature/AbsenceApiTest.php
```

Les tests Feature vérifient la route, le middleware, la validation, le service,
la base de données et la réponse JSON.

Scénarios minimaux :

1. utilisateur non authentifié : `401` ;
2. rôle interdit : `403` ;
3. payload invalide : `422` ;
4. ressource inexistante : `404` ;
5. création valide : `201` ;
6. lecture valide : `200` ;
7. modification valide : `200` ;
8. suppression valide : `200` ou `204` ;
9. tentative d’accès à une autre classe : `403` ou `404` ;
10. vérification de la base avec `assertDatabaseHas`.

Exemple de création :

```php
<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AbsenceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_enseignant_can_record_absences_for_his_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $classe = Classe::factory()->create();

        $classe->enseignants()->attach($enseignant->id);
        $classe->eleves()->attach($eleve->id);

        Sanctum::actingAs($enseignant);

        $this->postJson('/api/absences', [
            'date_absence' => '2026-06-14',
            'id_classe' => $classe->id,
            'absents' => [$eleve->id],
            'motif' => 'Non renseigné',
        ])
            ->assertCreated()
            ->assertJsonPath('data.0.id_eleve', $eleve->id);

        $this->assertDatabaseHas('absences', [
            'date_absence' => '2026-06-14',
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_enseignant' => $enseignant->id,
        ]);
    }

    public function test_enseignant_cannot_record_absence_for_other_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $classe = Classe::factory()->create();
        $classe->eleves()->attach($eleve->id);

        Sanctum::actingAs($enseignant);

        $this->postJson('/api/absences', [
            'date_absence' => '2026-06-14',
            'id_classe' => $classe->id,
            'absents' => [$eleve->id],
        ])->assertForbidden();
    }
}
```

## 13. Fichier 10 : tests Unit du service

Emplacement :

```text
backend/tests/Unit/AbsenceServiceTest.php
```

Les tests Unit doivent cibler les règles métier indépendamment du routage :

- création multiple ;
- absence de doublon ;
- rejet d’une classe non affectée ;
- rejet d’un élève hors classe ;
- filtrage selon le rôle ;
- transaction annulée en cas d’erreur.

Exécuter un fichier précis :

```powershell
php artisan test tests/Unit/AbsenceServiceTest.php
```

Exécuter uniquement les tests du module :

```powershell
php artisan test --filter=Absence
```

## 14. Fichier 11 : seeder éventuel

Emplacement :

```text
backend/database/seeders/AbsenceSeeder.php
```

Créer un seeder uniquement si des données de démonstration sont nécessaires :

```powershell
php artisan make:seeder AbsenceSeeder
```

Puis l’appeler dans `DatabaseSeeder.php` :

```php
$this->call([
    AbsenceSeeder::class,
]);
```

Ne pas dépendre d’identifiants écrits en dur. Rechercher les modèles ou utiliser
les factories.

## 15. Fichier 12 : Policy pour les autorisations fines

Pour les modules sensibles, utiliser une Policy :

```powershell
php artisan make:policy AbsencePolicy --model=Absence
```

Emplacement :

```text
backend/app/Policies/AbsencePolicy.php
```

Une Policy est recommandée lorsque les droits dépendent de la ressource :

- l’élève ne voit que ses absences ;
- l’enseignant ne voit que ses classes ;
- l’admin voit tout ;
- seul l’admin peut justifier ou supprimer.

Le middleware `check.role` ne remplace pas une Policy.

## 16. Commandes de validation obligatoires

Depuis `backend/` :

```powershell
php artisan optimize:clear
php artisan migrate:status
php artisan route:list --path=api
php artisan route:cache
php artisan route:clear
php artisan test
```

Vérification syntaxique PowerShell :

```powershell
$failed = @()

Get-ChildItem app,routes,database -Recurse -File -Filter *.php |
    ForEach-Object {
        php -l $_.FullName | Out-Null

        if ($LASTEXITCODE -ne 0) {
            $failed += $_.FullName
        }
    }

if ($failed.Count -gt 0) {
    $failed
    exit 1
}

Write-Output "Tous les fichiers PHP sont valides."
```

Lancer le serveur :

```powershell
php artisan serve
```

Vérifier ensuite :

```text
http://127.0.0.1:8000/up
http://127.0.0.1:8000/api/...
```

## 17. Test manuel avec PowerShell

Connexion :

```powershell
$login = Invoke-RestMethod `
    -Method Post `
    -Uri "http://127.0.0.1:8000/api/login" `
    -ContentType "application/json" `
    -Body (@{
        email = "enseignant@example.com"
        password = "password"
    } | ConvertTo-Json)

$token = $login.token
```

Créer une absence :

```powershell
Invoke-RestMethod `
    -Method Post `
    -Uri "http://127.0.0.1:8000/api/absences" `
    -Headers @{
        Authorization = "Bearer $token"
        Accept = "application/json"
    } `
    -ContentType "application/json" `
    -Body (@{
        date_absence = "2026-06-14"
        id_classe = 1
        absents = @(4, 5)
        motif = "Non renseigné"
    } | ConvertTo-Json)
```

## 18. Connexion avec le frontend

Après avoir terminé le backend, créer dans le frontend :

```text
frontend/src/app/services/absence/absenceService.js
```

Exemple :

```javascript
import { apiClient } from '../../core/api/apiClient'

export function listAbsences(filters = {}) {
  return apiClient('/absences', {
    params: filters,
  })
}

export function createAbsences(payload) {
  return apiClient('/absences', {
    method: 'POST',
    data: payload,
  })
}

export function updateAbsence(absenceId, payload) {
  return apiClient(`/absences/${absenceId}`, {
    method: 'PUT',
    data: payload,
  })
}

export function deleteAbsence(absenceId) {
  return apiClient(`/absences/${absenceId}`, {
    method: 'DELETE',
  })
}
```

Le chemin donné à `apiClient` ne doit pas répéter `/api`, car la base est déjà
configurée dans `frontend/src/app/core/api/apiClient.js`.

Avant d’intégrer le frontend, documenter :

- la méthode HTTP ;
- l’URL ;
- le rôle autorisé ;
- le payload ;
- la réponse ;
- les erreurs `401`, `403`, `404` et `422`.

## 19. Modules suivants recommandés

### Module Absences

Fichiers :

```text
database/migrations/..._update_absences_table.php
app/Models/Absence.php
database/factories/AbsenceFactory.php
app/Http/Requests/StoreAbsenceRequest.php
app/Http/Requests/UpdateAbsenceRequest.php
app/Services/AbsenceService.php
app/Http/Controllers/Api/AbsenceController.php
tests/Feature/AbsenceApiTest.php
tests/Unit/AbsenceServiceTest.php
```

### Module Bulletins

Fichiers :

```text
app/Models/Bulletin.php
database/factories/BulletinFactory.php
app/Http/Requests/GenerateBulletinRequest.php
app/Services/BulletinService.php
app/Http/Controllers/Api/BulletinController.php
tests/Feature/BulletinApiTest.php
tests/Unit/BulletinServiceTest.php
```

Fonctions principales :

- calculer la moyenne pondérée ;
- générer le bulletin d’une période ;
- calculer le rang ;
- empêcher un élève de consulter un autre bulletin ;
- permettre à l’admin de publier les bulletins.

### Module Justificatifs d’absence

Fichiers :

```text
database/migrations/..._create_justificatifs_table.php
app/Models/Justificatif.php
app/Http/Requests/StoreJustificatifRequest.php
app/Services/JustificatifService.php
app/Http/Controllers/Api/JustificatifController.php
tests/Feature/JustificatifApiTest.php
```

Prévoir :

- stockage du fichier ;
- types MIME autorisés ;
- taille maximale ;
- validation ou rejet par un admin ;
- contrôle d’accès au téléchargement.

### Module Notifications

Utiliser les notifications Laravel :

```powershell
php artisan make:notification AbsenceRecorded
php artisan make:notification BulletinPublished
```

Prévoir :

- notification à l’élève ou au parent ;
- notification lors d’une absence ;
- notification lors de la publication d’un bulletin ;
- file d’attente si l’envoi devient coûteux.

### Module Parents

Avant de coder, décider si un parent est :

- un utilisateur avec un nouveau rôle `PARENT` ;
- ou une entité séparée liée à plusieurs élèves.

Cette décision modifie `RoleEnum`, les middlewares, la table `users`, les
relations et l’authentification. Elle doit être validée par l’équipe avant la
migration.

## 20. Checklist avant commit

- [ ] La migration fonctionne avec `migrate:fresh`.
- [ ] Les clés étrangères et index sont définis.
- [ ] Le modèle contient les bons `$fillable` et casts.
- [ ] Les relations sont définies dans les deux sens.
- [ ] Les payloads sont validés par des Form Requests.
- [ ] Le contrôleur n’utilise pas `$request->all()`.
- [ ] Les règles métier sont dans un service ou une Policy.
- [ ] Les routes sont dans les bons groupes de rôles.
- [ ] Un utilisateur ne peut pas accéder aux données d’un autre.
- [ ] Les réponses JSON sont cohérentes.
- [ ] Les tests couvrent `401`, `403`, `404`, `422` et le succès.
- [ ] `php artisan route:cache` fonctionne.
- [ ] `php artisan test` passe entièrement.
- [ ] Aucun secret ou fichier `.env` n’est committé.
- [ ] Aucun fichier `vendor/` ou `node_modules/` n’est committé.

## 21. Commit et Pull Request

Vérifier les fichiers :

```powershell
git status --short
git diff --check
git diff
```

Ajouter seulement le module concerné :

```powershell
git add backend/app/Models/Absence.php
git add backend/app/Http/Requests/StoreAbsenceRequest.php
git add backend/app/Http/Requests/UpdateAbsenceRequest.php
git add backend/app/Services/AbsenceService.php
git add backend/app/Http/Controllers/Api/AbsenceController.php
git add backend/database/migrations
git add backend/database/factories/AbsenceFactory.php
git add backend/routes/api.php
git add backend/tests/Feature/AbsenceApiTest.php
git add backend/tests/Unit/AbsenceServiceTest.php
```

Créer le commit :

```powershell
git commit -m "feat(absences): add absence management API"
git push origin abdou-complete
```

La Pull Request doit indiquer :

- le module ajouté ;
- les rôles autorisés ;
- les nouvelles routes ;
- les migrations ;
- les tests exécutés ;
- les éventuelles décisions métier restant à valider.

