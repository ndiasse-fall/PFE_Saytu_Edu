import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/context/useAuth'
import { menuItems } from '../../../util/menu'

export function Sidebar({ isOpen, onClose }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const sections = menuItems.filter((section) => section.roles.includes(user?.role))
  const canAccessSettings = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  const accountLabel = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      return 'Saytou Admin'
    }

    return `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || 'Utilisateur'
  }, [user?.nom, user?.prenom, user?.role])

  function handleAccountNavigation(path) {
    setProfileMenuOpen(false)
    onClose()
    navigate(path)
  }

  async function handleSignOut() {
    setProfileMenuOpen(false)
    onClose()
    await signOut()
  }

  function handleNavigationClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      onClose()
    }
  }

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <aside id="main-sidebar" className={`sidebar${isOpen ? ' is-open' : ''}`}>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.section} className="sidebar-section">
              <p className="sidebar-title">{section.section}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  onClick={handleNavigationClick}
                >
                  {item.icon ? <i className={`sidebar-link-icon bi ${item.icon}`} aria-hidden="true" /> : null}
                  <span className="sidebar-link-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-account">
          <button
            type="button"
            className="sidebar-account-trigger"
            onClick={() => setProfileMenuOpen((current) => !current)}
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
          >
            <span className="sidebar-account-avatar" aria-hidden="true">
              <i className="bi bi-person-circle" />
            </span>
            <span className="sidebar-account-copy">
              <strong>{accountLabel}</strong>
              <span>{user?.role ?? 'Sans rôle'}</span>
            </span>
            <i className={`bi ${profileMenuOpen ? 'bi-chevron-down' : 'bi-chevron-right'}`} aria-hidden="true" />
          </button>

          {profileMenuOpen ? (
            <div className="sidebar-account-menu" role="menu">
              {canAccessSettings ? (
                <button
                  type="button"
                  className="sidebar-account-action"
                  onClick={() => handleAccountNavigation('/admin/settings')}
                >
                  <i className="bi bi-person-gear" aria-hidden="true" />
                  <span>Mon compte</span>
                </button>
              ) : null}
              <button type="button" className="sidebar-account-action" onClick={() => void handleSignOut()}>
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
