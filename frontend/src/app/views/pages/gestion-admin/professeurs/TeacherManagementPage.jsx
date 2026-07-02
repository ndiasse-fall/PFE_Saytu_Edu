import { useState } from 'react'
import { CrudManagementPage } from '../../../../shared/components/crud'
import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  showTeacher,
  toggleTeacherActive,
  updateTeacher,
} from '../../../../services/professeurs/teacherService'
import { AssignClassesDrawer } from './AssignClassesDrawer'

const service = {
  list: listTeachers,
  show: showTeacher,
  create: createTeacher,
  update: updateTeacher,
  remove: deleteTeacher,
  toggle: toggleTeacherActive,
}

export function TeacherManagementPage() {
  const [assignTeacher, setAssignTeacher] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const config = {
    title: 'Gestion des professeurs',
    singularLabel: 'Professeur',
    pluralLabel: 'Liste des professeurs',
    initialFilters: {
      search: '',
      actif: '',
      page: 1,
      per_page: 15,
    },
    filterFields: [
      {
        name: 'search',
        label: 'Recherche',
        placeholder: 'Nom, prénom, email ou téléphone...',
      },
      {
        name: 'actif',
        label: 'Statut',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          { value: '1', label: 'Actifs' },
          { value: '0', label: 'Inactifs' },
        ],
      },
    ],
    fields: [
      { name: 'nom', label: 'Nom', required: true },
      { name: 'prenom', label: 'Prénom', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'matricule_enseignant', label: 'Matricule', placeholder: 'Généré automatiquement si vide' },
      { name: 'specialite', label: 'Spécialité', required: true },
      { name: 'date_embauche', label: 'Date embauche', type: 'date', required: true },
      { name: 'telephone', label: 'Téléphone' },
      { name: 'adresse', label: 'Adresse', type: 'textarea', fullWidth: true },
      { name: 'actif', label: 'Actif', type: 'checkbox', defaultValue: true },
    ],
    columns: [
      { key: 'matricule_enseignant', label: 'Matricule' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'nom', label: 'Nom' },
      { key: 'email', label: 'Email' },
      { key: 'specialite', label: 'Spécialité' },
      {
        key: 'actif',
        label: 'Statut',
        render: (value) => (value ? 'Actif' : 'Inactif'),
      },
    ],
    extraActions: (item) => [
      {
        label: 'Attribuer classes',
        onClick: () => setAssignTeacher(item),
      },
    ],
  }

  return (
    <>
      <CrudManagementPage
        key={refreshKey}
        config={config}
        service={service}
        permissions={{
          create: true,
          show: true,
          edit: true,
          delete: true,
        }}
      />

      <AssignClassesDrawer
        teacher={assignTeacher}
        open={Boolean(assignTeacher)}
        onClose={() => setAssignTeacher(null)}
        onSuccess={() => setRefreshKey((key) => key + 1)}
      />
    </>
  )
}

export default TeacherManagementPage