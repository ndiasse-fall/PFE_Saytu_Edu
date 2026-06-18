# Composant CRUD réutilisable

`CrudManagementPage` reproduit le fonctionnement de la gestion des utilisateurs
sans recopier toute la page :

- liste et pagination ;
- filtres ;
- création ;
- modification ;
- consultation des détails ;
- suppression ;
- erreurs Laravel `422` ;
- permissions d'affichage.

Il utilise uniquement les classes CSS déjà présentes dans le projet.

## Contrat du service

Le service d'un module doit exposer :

```javascript
export const subjectService = {
  list(filters) {},
  show(id) {},
  create(payload) {},
  update(id, payload) {},
  remove(id) {},
}
```

## Exemple : matières

```jsx
import { CrudManagementPage } from '../../../shared/components/crud'
import {
  createSubject,
  deleteSubject,
  listSubjects,
  showSubject,
  updateSubject,
} from '../../../services/subject/subjectService'

const service = {
  list: listSubjects,
  show: showSubject,
  create: createSubject,
  update: updateSubject,
  remove: deleteSubject,
}

const config = {
  title: 'Gestion des matières',
  singularLabel: 'Matière',
  pluralLabel: 'Liste des matières',
  initialFilters: { search: '' },
  filterFields: [
    {
      name: 'search',
      label: 'Recherche',
      placeholder: 'Nom ou code...',
    },
  ],
  fields: [
    {
      name: 'nom',
      label: 'Nom',
      required: true,
    },
    {
      name: 'code',
      label: 'Code',
      required: true,
    },
    {
      name: 'coefficient',
      label: 'Coefficient',
      type: 'number',
      min: 1,
      required: true,
      toPayload: (value) => Number(value),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      fullWidth: true,
      toPayload: (value) => value || null,
    },
  ],
  columns: [
    { key: 'nom', label: 'Nom' },
    { key: 'code', label: 'Code' },
    { key: 'coefficient', label: 'Coefficient' },
  ],
}

export function SubjectManagementPage() {
  return (
    <CrudManagementPage
      config={config}
      service={service}
      permissions={{
        create: true,
        show: true,
        edit: true,
        delete: true,
      }}
    />
  )
}
```

## Définition d'un champ

| Propriété | Utilité |
|---|---|
| `name` | Nom du champ dans le formulaire |
| `label` | Libellé affiché |
| `type` | `text`, `email`, `number`, `date`, `select`, `textarea`, `checkbox` |
| `required` | Champ obligatoire, ou fonction selon le mode |
| `defaultValue` | Valeur utilisée à la création |
| `options` | Options d'un champ `select` |
| `fullWidth` | Utilise la largeur complète du formulaire |
| `fromItem` | Transforme la valeur reçue avant modification |
| `toPayload` | Transforme la valeur avant envoi à Laravel |
| `omitOnEdit` | N'envoie pas une valeur vide pendant la modification |
| `payloadKey` | Change le nom envoyé au backend |

## Colonnes et détails

Une colonne simple :

```javascript
{ key: 'nom', label: 'Nom' }
```

Une propriété imbriquée :

```javascript
{ key: 'classe.nom_classe', label: 'Classe' }
```

Un rendu personnalisé :

```jsx
{
  key: 'actif',
  label: 'Statut',
  render: (value) => (
    <span className={`badge ${value ? 'badge-active' : 'badge-inactive'}`}>
      {value ? 'Actif' : 'Inactif'}
    </span>
  ),
}
```

Le tableau `details` est facultatif. Sans lui, les colonnes servent aussi pour
le panneau de détails.
