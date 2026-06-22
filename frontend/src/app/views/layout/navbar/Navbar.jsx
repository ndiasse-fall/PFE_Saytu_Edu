import { Link } from "react-router-dom";
import { useAuth } from "../../../core/context/useAuth";

export function Navbar({ isSidebarOpen, onToggleSidebar }) {
    const { user } = useAuth();
    const fullName =
        `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Utilisateur";
    const initials = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}` || "U";

    return (
        <header className="topbar">
            <div className="topbar-title">
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label={
                        isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"
                    }
                    aria-expanded={isSidebarOpen}
                    aria-controls="main-sidebar"
                >
                    <i
                        className={`bi ${isSidebarOpen ? "bi-x-lg" : "bi-list"}`}
                        aria-hidden="true"
                    />
                </button>
                <label className="topbar-search">
                    <i className="bi bi-search" aria-hidden="true" />
                    <input
                        type="search"
                        aria-label="Rechercher"
                        placeholder="Rechercher..."
                    />
                </label>
            </div>
            <div className="topbar-actions">
                <div className="school-year">2025 – 2026</div>
                <Link
                    className="topbar-profile"
                    to="/settings"
                    aria-label={`Ouvrir le profil de ${fullName}`}
                >
                    <span className="topbar-profile-avatar" aria-hidden="true">
                        {initials}
                    </span>
                    <span className="topbar-profile-copy">
                        <strong translate="no">{fullName}</strong>
                        <small>{user?.role ?? "Sans rôle"}</small>
                    </span>
                </Link>
            </div>
        </header>
    );
}
