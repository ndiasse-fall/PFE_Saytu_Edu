<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NoteController extends Controller
{
    /**
     * =====================================================
     * LISTE DES NOTES
     * =====================================================
     */
    public function index(Request $request)
    {
        $query = Note::with([
            'eleve',
            'matiere',
            'classe'
        ]);

        /*
        |--------------------------------------------------------------------------
        | Recherche
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('type_evaluation', 'LIKE', "%{$search}%")
                  ->orWhere('periode', 'LIKE', "%{$search}%")
                  ->orWhere('valeur', 'LIKE', "%{$search}%")

                  ->orWhereHas('eleve', function ($e) use ($search) {

                      $e->where('nom', 'LIKE', "%{$search}%")
                        ->orWhere('prenom', 'LIKE', "%{$search}%");

                  })

                  ->orWhereHas('matiere', function ($m) use ($search) {

                      $m->where('nom_matiere', 'LIKE', "%{$search}%");

                  })

                  ->orWhereHas('classe', function ($c) use ($search) {

                     $c->where('nom_classe', 'LIKE', "%{$search}%");

                  });

            });

        }

        /*
        |--------------------------------------------------------------------------
        | Filtres
        |--------------------------------------------------------------------------
        */

        if ($request->filled('id_classe')) {

            $query->where('id_classe', $request->id_classe);

        }

        if ($request->filled('id_matiere')) {

            $query->where('id_matiere', $request->id_matiere);

        }

        if ($request->filled('id_eleve')) {

            $query->where('id_eleve', $request->id_eleve);

        }

        if ($request->filled('periode')) {

            $query->where('periode', $request->periode);

        }

        if ($request->filled('type_evaluation')) {

            $query->where('type_evaluation', $request->type_evaluation);

        }

        /*
        |--------------------------------------------------------------------------
        | Tri
        |--------------------------------------------------------------------------
        */

        $sortBy = $request->get('sort_by', 'created_at');

        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSorts = [
            'created_at',
            'valeur',
            'periode',
            'type_evaluation'
        ];

        if (!in_array($sortBy, $allowedSorts)) {

            $sortBy = 'created_at';

        }

        $query->orderBy($sortBy, $sortOrder);

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $perPage = $request->get('per_page', 10);

        $notes = $query->paginate($perPage);

        /*
        |--------------------------------------------------------------------------
        | Réponse JSON
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' => 'Liste des notes récupérée avec succès.',

            'data' => $notes->items(),

            'pagination' => [

                'current_page' => $notes->currentPage(),

                'last_page' => $notes->lastPage(),

                'per_page' => $notes->perPage(),

                'total' => $notes->total(),

            ]

        ]);
    }

        /**
     * =====================================================
     * AJOUTER UNE NOTE
     * =====================================================
     */
    public function store(StoreNoteRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $classe = Classe::with(['enseignants', 'eleves'])->find($validated['id_classe']);
        if (! $classe || ! $classe->enseignants->contains($user->id)) {
            return response()->json([
                'message' => 'Accès refusé: vous n\'êtes pas affecté à cette classe.'
            ], 403);
        }

        // Vérifier que tous les élèves appartiennent à la classe
        $invalidEleves = collect($validated['notes'])->pluck('id_eleve')
            ->filter(fn($id) => ! $classe->eleves->contains($id));

        if ($invalidEleves->isNotEmpty()) {
            return response()->json([
                'message' => 'Certains élèves ne sont pas inscrits dans cette classe.',
                'invalid_eleve_ids' => $invalidEleves->values(),
            ], 422);
        }

        $notes = [];
        foreach ($validated['notes'] as $noteData) {
            $notes[] = Note::updateOrCreate(
                [
                    'id_eleve' => $noteData['id_eleve'],
                    'id_classe' => $validated['id_classe'],
                    'id_matiere' => $validated['id_matiere'],
                    'type_evaluation' => $validated['type_evaluation'],
                    'periode' => $validated['periode'],
                ],
                [
                    'valeur' => $noteData['valeur'],
                    'type_evaluation' => $validated['type_evaluation'],
                    'periode' => $validated['periode'],
                ]
            );
        }

        return response()->json([

            'success' => true,

            'message' => 'La note a été ajoutée avec succès.',

            'data' => $note

        ], 201);
    }

    /**
     * =====================================================
     * DETAIL D'UNE NOTE
     * =====================================================
     */
    public function show($id)
    {
        $note = Note::with([
            'eleve',
            'matiere',
            'classe'
        ])->find($id);

        if (!$note) {

            return response()->json([

                'success' => false,

                'message' => 'Note introuvable.'

            ], 404);

        }

        return response()->json([

            'success' => true,

            'message' => 'Détail de la note.',

            'data' => $note

        ]);
    }

    /**
 * =====================================================
 * MODIFIER UNE NOTE
 * =====================================================
 */
public function update(Request $request, $id)
{
    $note = Note::find($id);

    if (!$note) {

        return response()->json([
            'success' => false,
            'message' => 'Note introuvable.'
        ],404);

    }

    $validated = $request->validate([

        'valeur' => [
            'required',
            'numeric',
            'min:0',
            'max:20'
        ],

        'type_evaluation' => [
            'required',
            'string',
            'max:255'
        ],

        'periode' => [
            'required',
            'string',
            'max:255'
        ],

        'id_eleve' => [
            'required',
            'exists:users,id'
        ],

        'id_matiere' => [
            'required',
            'exists:matieres,id'
        ],

        'id_classe' => [
            'required',
            'exists:classes,id'
        ]

    ]);

    $note->update($validated);

    $note->load([
        'eleve',
        'matiere',
        'classe'
    ]);

    return response()->json([

        'success'=>true,

        'message'=>'Note modifiée avec succès.',

        'data'=>$note

    ]);

}

/**
 * =====================================================
 * SUPPRIMER UNE NOTE
 * =====================================================
 */
public function destroy($id)
{
    $note = Note::find($id);

    if(!$note){

        return response()->json([

            'success'=>false,

            'message'=>'Note introuvable.'

        ],404);

    }

    $note->delete();

    return response()->json([

        'success'=>true,

        'message'=>'La note a été supprimée avec succès.'

    ]);

}

    /**
     * =====================================================
     * RÉSULTATS PAR CLASSE
     * =====================================================
     */
    public function update(UpdateNoteRequest $request, int $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        if (! $note->classe || ! $note->classe->enseignants->contains($request->user()->id)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Résultats de la classe récupérés avec succès.',
            'count' => $notes->count(),
            'data' => $notes
        ]);
    }

    /**
     * =====================================================
     * RÉSULTATS PAR ÉLÈVE
     * =====================================================
     */
    public function destroy(Request $request, int $id)
    {
        $note = Note::with('classe.enseignants')->find($id);

        if (! $note) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        if (! $note->classe || ! $note->classe->enseignants->contains($request->user()->id)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Résultats de l\'élève récupérés avec succès.',
            'count' => $notes->count(),
            'data' => $notes
        ]);
    }
}
