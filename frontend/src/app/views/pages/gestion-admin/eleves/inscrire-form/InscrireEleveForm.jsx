import { useMemo, useState } from 'react'

export function InscrireEleveForm({
  eleve,
  classes,
  selectedClasse,
  submitting,
  onClasseChange,
  onSubmit,
  onCancel,
}) {
  const [selectedNiveau, setSelectedNiveau] = useState('')

  // Extraire les niveaux uniques disponibles avec sécurité accrue
  const niveaux = useMemo(() => {
    if (!Array.isArray(classes)) return []
    const uniqueNiveaux = [...new Set(classes.map((c) => c?.niveau))]
    return uniqueNiveaux.filter(Boolean).sort()
  }, [classes])

  // Filtrer les classes selon le niveau sélectionné avec sécurité accrue
  const filteredClasses = useMemo(() => {
    if (!selectedNiveau || !Array.isArray(classes)) return []
    return classes.filter((c) => c?.niveau === selectedNiveau)
  }, [classes, selectedNiveau])

  const handleNiveauChange = (e) => {
    const niveau = e?.target?.value || ''
    setSelectedNiveau(niveau)
    // Réinitialiser la classe sélectionnée si on change de niveau
    if (typeof onClasseChange === 'function') {
      onClasseChange({ target: { name: 'classeId', value: '' } })
    }
  }

  const handleCancelClick = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }

  // Ne pas rendre le contenu si l'élève n'est pas encore défini (sécurité Drawer)
  if (!eleve) {
    return <div className="screen-state">Préparation du formulaire...</div>
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="full-width info-panel" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <p>Inscrire l'élève : <strong>{eleve.prenom} {eleve.nom}</strong></p>
      </div>
      
      <label className="full-width">
        <span>Filtrer par niveau</span>
        <select value={selectedNiveau} onChange={handleNiveauChange} required>
          <option value="">Sélectionner un niveau</option>
          {niveaux.map((niveau) => (
            <option key={niveau} value={niveau}>
              {niveau}
            </option>
          ))}
        </select>
      </label>

      <label className="full-width">
        <span>Choisir une classe (Niveau {selectedNiveau || '...'})</span>
        <select 
          name="classeId" 
          value={selectedClasse || ''} 
          onChange={onClasseChange} 
          disabled={!selectedNiveau}
          required
        >
          <option value="">
            {!selectedNiveau ? 'Veuillez d\'abord choisir un niveau' : 'Sélectionner la classe'}
          </option>
          {filteredClasses.map((classe) => (
            <option key={classe?.id} value={classe?.id}>
              {classe?.nom_classe} ({classe?.annee_scolaire})
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions full-width">
        <button type="button" className="ghost-button" onClick={handleCancelClick}>
          Annuler
        </button>
        <button type="submit" disabled={submitting || !selectedClasse}>
          {submitting ? 'Inscription...' : 'Inscrire dans la classe'}
        </button>
      </div>
    </form>
  )
}
