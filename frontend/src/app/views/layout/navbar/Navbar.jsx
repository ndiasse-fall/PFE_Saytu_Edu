import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { BrandLogo } from '../../../shared/components/branding/BrandLogo'

export function Navbar({ isSidebarOpen, onToggleSidebar }) {
  const location = useLocation()

  const title = useMemo(() => {
    if (location.pathname.includes('/gestion-admin/users')) {
      return 'Gestion des utilisateurs'
    }

    if (location.pathname.includes('/settings')) {
      return 'Paramètres'
    }

    return 'Tableau de bord'
  }, [location.pathname])

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
        >
          <i className={`bi sidebar-toggle-desktop-icon ${isSidebarOpen ? 'bi-list' : 'bi-chevron-right'}`} aria-hidden="true" />
          <i className={`bi sidebar-toggle-mobile-icon ${isSidebarOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
        </button>
        <div className="topbar-brand">
          <BrandLogo size="md" />
        </div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="school-year">2025 – 2026</div>
      </div>
    </header>
  )
}
