import { CrudManagementPage } from '../../../../shared/components/crud'
import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  showTeacher,
  toggleTeacherActive,
  updateTeacher,
} from '../../../../services/professeurs/teacherService'

const service = {
  list: listTeachers,
  show: showTeacher,
  create: createTeacher,
  update: updateTeacher,
  remove: deleteTeacher,
  toggle: toggleTeacherActive,
}

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
    {
      name: 'password',
      label: 'Mot de passe',
      type: 'password',
      required: (mode) => mode === 'create',
      omitOnEdit: true,
    },
    { name: 'matricule_enseignant', label: 'Matricule', required: true },
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
}

export function TeacherManagementPage() {
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