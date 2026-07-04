import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/context/useAuth";

function getUserInitials(user) {
    const words = [user?.prenom, user?.nom].filter(Boolean);

    if (words.length > 0) {
        return words
            .slice(0, 2)
            .map((word) => word.trim().charAt(0))
            .join("")
            .toUpperCase();
    }

    return user?.email?.trim().charAt(0).toUpperCase() ?? "";
}

export function Navbar({ isSidebarOpen, onToggleSidebar }) {
    const { user, signOut } = useAuth();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const fullName =
        `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || user?.email || "Compte utilisateur";
    const initials = getUserInitials(user);

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
                <div className="topbar-profile-wrap">
                    <button
                        type="button"
                        className="topbar-profile"
                        onClick={() => setProfileMenuOpen((current) => !current)}
                        aria-expanded={profileMenuOpen}
                        aria-haspopup="menu"
                        aria-controls="topbar-profile-menu"
                        aria-label={`Ouvrir le profil de ${fullName}`}
                    >
                        <span className="topbar-profile-avatar" aria-hidden="true">
                            {initials}
                        </span>
                        <span className="topbar-profile-copy">
                            <strong translate="no">{fullName}</strong>
                            <small>{user?.role ?? "Sans rôle"}</small>
                        </span>
                        <i className={`bi ${profileMenuOpen ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true" />
                    </button>

                    {profileMenuOpen ? (
                        <div id="topbar-profile-menu" className="topbar-profile-menu" role="menu">
                            <Link
                                className="topbar-profile-menu-item"
                                to="/settings"
                                role="menuitem"
                                onClick={() => setProfileMenuOpen(false)}
                            >
                                <i className="bi bi-person-gear" aria-hidden="true" />
                                <span>Mon compte</span>
                            </Link>
                            <button
                                type="button"
                                className="topbar-profile-menu-item"
                                role="menuitem"
                                onClick={() => {
                                    setProfileMenuOpen(false);
                                    void signOut();
                                }}
                            >
                                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
