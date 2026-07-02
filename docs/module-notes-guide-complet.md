# Module Notes - Tache Fatimata Diallo

Branche cible : `fatimataDiallo`

Username GitHub : `fatimata-dev1`

## Objectif

Mettre en place une version complete et coherente du module Notes.

Le module permet aux enseignants de saisir, modifier et consulter les notes des eleves. Les notes dependent des eleves, des classes, des matieres et des enseignants.

Ce module bloque les bulletins, car les bulletins utilisent les notes pour calculer les moyennes.

## Fichiers concernes

Backend :

- `backend/app/Http/Controllers/NoteController.php`
- `backend/app/Http/Requests/StoreNoteRequest.php`
- `backend/app/Http/Requests/UpdateNoteRequest.php`
- `backend/app/Models/Note.php`
- `backend/routes/api.php`
- `backend/tests/Feature/NoteApiTest.php`

Frontend :

- `frontend/src/app/services/notes/noteService.js`
- `frontend/src/app/views/pages/gestion-admin/notes/NoteList.jsx`
- `frontend/src/app/views/pages/gestion-admin/notes/EleveNotesDetailPage.jsx`
- `frontend/src/app/views/pages/gestion-admin/notes/ClasseResultsPage.jsx`
- `frontend/src/app/router/AppRouter.jsx`
- `frontend/src/app/util/menu.js`

## Regles metier

SUPER_ADMIN et ADMIN :

- voient toutes les notes ;
- peuvent saisir des notes pour toutes les classes ;
- peuvent modifier et supprimer toutes les notes ;
- peuvent consulter les resultats par classe.

ENSEIGNANT :

- voit uniquement les notes des classes auxquelles il est affecte ;
- peut saisir, modifier et supprimer uniquement dans ses classes ;
- ne peut pas acceder aux classes non affectees.

ELEVE :

- voit uniquement ses propres notes ;
- ne peut pas creer, modifier ou supprimer une note.

## Endpoints API attendus

Liste et detail :

```txt
GET /api/notes
GET /api/notes/{id}
```

Resultats :

```txt
GET /api/notes/resultats/classe/{id}
GET /api/notes/resultats/eleve/{id}
```

Ecriture :

```txt
POST /api/notes
POST /api/notes/saisir
PUT /api/notes/{id}
DELETE /api/notes/{id}
```

## Filtres supportes

`GET /api/notes` doit accepter :

- `id_eleve`
- `classe`
- `matiere`
- `periode`
- `search`

`GET /api/notes/resultats/classe/{id}` doit accepter :

- `matiere`
- `periode`

`GET /api/notes/resultats/eleve/{id}` doit accepter :

- `classe`
- `matiere`
- `periode`

## Payload de creation

```json
{
  "id_classe": 1,
  "id_matiere": 2,
  "type_evaluation": "Devoir 1",
  "periode": "Semestre 1",
  "notes": [
    {
      "id_eleve": 10,
      "valeur": 15
    }
  ]
}
```

## Payload de modification

```json
{
  "valeur": 16,
  "type_evaluation": "Devoir 2",
  "periode": "Semestre 1",
  "id_matiere": 2
}
```

## Backend a verifier

`NoteController@index` :

- filtre les notes selon le role ;
- filtre par `id_eleve`, classe, matiere, periode et recherche.

`NoteController@store` :

- autorise ADMIN/SUPER_ADMIN ;
- autorise ENSEIGNANT seulement si affecte a la classe ;
- refuse un eleve qui n'appartient pas a la classe ;
- remplace la note existante si meme eleve, classe, matiere, type et periode.

`NoteController@update` :

- utilise `UpdateNoteRequest` ;
- met a jour `valeur`, `type_evaluation`, `periode`, `id_matiere`.

`NoteController@resultatsParClasse` :

- retourne la classe ;
- retourne les resultats par eleve ;
- retourne la moyenne de chaque eleve ;
- retourne la moyenne globale de la classe.

`NoteController@resultatsParEleve` :

- retourne les notes de l'eleve ;
- retourne la moyenne ;
- respecte les droits selon le role.

## Frontend a livrer

### Liste notes

Route :

```txt
/notes
```

Fonctions :

- afficher les classes ;
- filtrer par niveau/classe/matiere/periode ;
- rechercher un eleve ;
- ouvrir le detail d'un eleve ;
- ouvrir les resultats par classe.

### Detail notes eleve

Route :

```txt
/notes/:eleveId
```

Fonctions :

- afficher les notes par semestre ;
- ajouter une note ;
- modifier une note ;
- supprimer une note ;
- afficher les erreurs backend.

### Resultats classe

Route :

```txt
/notes/resultats/classe/:classeId
```

Fonctions :

- afficher la moyenne de classe ;
- afficher la moyenne par eleve ;
- filtrer par matiere ;
- filtrer par periode ;
- ouvrir le detail des notes d'un eleve.

## Service frontend

Le service `noteService.js` doit exposer :

- `getNotes`
- `getNoteById`
- `createNote`
- `updateNote`
- `deleteNote`
- `getResultatsParClasse`
- `getResultatsParEleve`

## Tests a faire

Backend :

```bash
cd backend
php artisan test --filter=NoteApiTest
```

Frontend :

```bash
cd frontend
npm run build
```

Tests manuels :

- admin peut creer une note ;
- enseignant peut creer une note dans sa classe ;
- enseignant ne peut pas creer une note dans une autre classe ;
- note superieure a 20 refusee ;
- modification valeur/type/periode/matiere conservee apres refresh ;
- resultats par classe affichent moyenne classe et moyenne eleve ;
- eleve ne voit que ses notes.

## Definition of Done

La tache est terminee si :

- aucun marqueur de conflit Git ne reste dans les fichiers ;
- les tests backend Notes passent ;
- le build frontend passe ;
- les routes Notes fonctionnent ;
- les droits par role sont respectes ;
- le module Bulletins peut utiliser les notes.

