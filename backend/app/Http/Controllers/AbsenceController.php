<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Absence::with('eleve')
            ->latest('date_absence')
            ->latest('id');

        if ($user->isEnseignant()) {
            $classeIds = $user->classes()->pluck('classes.id');
            $query->whereHas('eleve.eleveClasses', function ($builder) use ($classeIds): void {
                $builder->whereIn('classes.id', $classeIds);
            });
        } elseif ($user->isEleve()) {
            $query->where('id_eleve', $user->id);
        }

        if ($request->filled('id_eleve')) {
            $query->where('id_eleve', $request->integer('id_eleve'));
        }

        if ($request->filled('date_absence')) {
            $query->whereDate('date_absence', $request->date('date_absence'));
        }

        if ($request->has('est_justifiee')) {
            $query->where('est_justifiee', $request->boolean('est_justifiee'));
        }

        $absences = $query->get();

        return response()->json([
            'success' => true,
            'count' => $absences->count(),
            'data' => $absences,
        ]);
    }

    public function store(StoreAbsenceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $absences = collect($validated['absents'])
            ->map(fn(int $eleveId): Absence => Absence::updateOrCreate(
                [
                    'date_absence' => $validated['date_absence'],
                    'id_eleve' => $eleveId,
                ],
                [
                    'motif' => $validated['motif'] ?? null,
                    'est_justifiee' => $validated['est_justifiee'] ?? false,
                ]
            ))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $absences,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $absence = Absence::with('eleve.eleveClasses')->find($id);

        if (! $absence || ! $this->canRead($request, $absence)) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $absence,
        ]);
    }

    public function update(StoreAbsenceRequest $request, int $id): JsonResponse
    {
        $absence = Absence::find($id);

        if (! $absence) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $validated = $request->validated();
        $absence->update([
            'date_absence' => $validated['date_absence'],
            'id_eleve' => $validated['absents'][0],
            'motif' => $validated['motif'] ?? null,
            'est_justifiee' => $validated['est_justifiee'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $absence->fresh('eleve'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $absence = Absence::find($id);

        if (! $absence) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $absence->delete();

        return response()->json([
            'success' => true,
            'message' => 'Absence supprimée avec succès.',
        ]);
    }

    private function canRead(Request $request, Absence $absence): bool
    {
        $user = $request->user();

        if ($user->isAdministrateur() || $user->isSuperAdministrateur()) {
            return true;
        }

        if ($user->isEleve()) {
            return $absence->id_eleve === $user->id;
        }

        if ($user->isEnseignant()) {
            $classeIds = $user->classes()->pluck('classes.id');

            return $absence->eleve->eleveClasses
                ->pluck('id')
                ->intersect($classeIds)
                ->isNotEmpty();
        }

        return false;
    }
}
