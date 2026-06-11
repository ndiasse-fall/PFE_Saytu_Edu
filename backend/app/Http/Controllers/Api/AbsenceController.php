<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceRequest;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    // =========================
    // CREATE ABSENCES
    // =========================
    public function store(StoreAbsenceRequest $request)
    {
        $data = $request->validated();

        foreach ($data['absents'] as $eleveId) {

            // éviter doublon même date
            $exists = Absence::where('id_eleve', $eleveId)
                ->where('date_absence', $data['date_absence'])
                ->exists();

            if (!$exists) {
                Absence::create([
                    'id_eleve' => $eleveId,
                    'date_absence' => $data['date_absence'],
                    'motif' => $data['motif'] ?? null,
                    'est_justifiee' => false,
                ]);
            }
        }

        return response()->json([
            'message' => 'Absences enregistrées avec succès',
            'total' => count($data['absents'])
        ], 201);
    }

    // =========================
    // LIST ALL ABSENCES
    // =========================
    public function index(Request $request)
    {
        $query = Absence::with('eleve');

        // filtre optionnel par élève
        if ($request->has('eleve_id')) {
            $query->where('id_eleve', $request->eleve_id);
        }

        // filtre optionnel par date
        if ($request->has('date')) {
            $query->where('date_absence', $request->date);
        }

        $absences = $query->latest()->get();

        return response()->json([
            'data' => $absences,
            'total' => $absences->count()
        ]);
    }

    // =========================
    // UPDATE ABSENCE (justifier ou modifier motif)
    // =========================
    public function update(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);

        $request->validate([
            'motif' => 'nullable|string|max:255',
            'est_justifiee' => 'nullable|boolean',
        ]);

        $absence->update([
            'motif' => $request->motif ?? $absence->motif,
            'est_justifiee' => $request->est_justifiee ?? $absence->est_justifiee,
        ]);

        return response()->json([
            'message' => 'Absence mise à jour avec succès',
            'data' => $absence
        ]);
    }
}