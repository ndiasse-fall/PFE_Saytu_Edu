import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/context/useAuth";
import { BrandLogo } from "../../../shared/components/branding/BrandLogo";
import { menuItems } from "../../../util/menu";

export function Sidebar({ isOpen, onClose, onToggle }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    
    // État pour gérer les dropdowns (support multiple)
    const [openDropdowns, setOpenDropdowns] = useState({});

    const sections = menuItems.filter((section) =>
        section.roles.includes(user?.role),
    );
    const canAccessSettings =
        user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "ELEVE";
    const accountLabel = useMemo(() => {
        if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
            return "Saytu Admin";
        }

        return (
            `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || "Utilisateur"
        );
    }, [user?.nom, user?.prenom, user?.role]);

    function handleAccountNavigation(path) {
        setProfileMenuOpen(false);
        if (typeof window !== "undefined" && window.innerWidth < 992) {
            onClose();
        }
        navigate(path);
    }

    async function handleSignOut() {
        setProfileMenuOpen(false);
        if (typeof window !== "undefined" && window.innerWidth < 992) {
            onClose();
        }
        await signOut();
    }

    function handleNavigationClick() {
        if (typeof window !== "undefined" && window.innerWidth < 992) {
            onClose();
        }
    }

    const toggleDropdown = (label) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <>
            <button
                type="button"
                className={`sidebar-backdrop${isOpen ? " is-open" : ""}`}
                onClick={onClose}
                aria-label="Fermer le menu"
            />
            <aside
                id="main-sidebar"
                className={`sidebar${isOpen ? " is-open" : ""}`}
            >
                <div className="sidebar-header">
                    <BrandLogo size="md" light />
                    <button
                        type="button"
                        className="sidebar-header-toggle"
                        onClick={onToggle}
                        aria-label={
                            isOpen ? "Réduire le menu" : "Développer le menu"
                        }
                        aria-expanded={isOpen}
                    >
                        <i
                            className={`bi ${isOpen ? "bi-list" : "bi-chevron-right"}`}
                            aria-hidden="true"
                        />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {sections.map((section) => (
                        <div key={section.section} className="sidebar-section">
                            <p className="sidebar-title">{section.section}</p>
                            {section.items.map((item) => {
                                // --- LOGIQUE DROPDOWN ---
                                if (item.isDropdown) {
                                    const isOpen = openDropdowns[item.label] || false;
                                    return (
                                        <div key={item.label} className="w-100">
                                            {/* Bouton Principal déclencheur */}
                                            <button
                                                type="button"
                                                className={`sidebar-link mb-1 w-100`}
                                                onClick={() => toggleDropdown(item.label)}
                                                style={{ background: 'none', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}
                                            >
                                                <i className={`sidebar-link-icon bi ${item.icon}`} aria-hidden="true" />
                                               <span className="sidebar-link-label">
                                                         {item.label}
                                                </span>
                                                 
                                                <i
                                                    className={`bi ${isOpen ? "bi-chevron-down" : "bi-chevron-right"}`}
                                                    style={{
                                                        fontSize: "12px",
                                                        marginLeft: "6px"
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            {/* Rendu des enfants si le menu est ouvert */}
                                            {isOpen && (
                                                <div className="ps-4 d-flex flex-column">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.path}
                                                            to={child.path}
                                                            className={({ isActive }) =>
                                                                `sidebar-link${isActive ? " active" : ""} mb-1 py-1`
                                                            }
                                                            onClick={handleNavigationClick}
                                                            style={{ fontSize: '14px', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        >
                                                            {child.icon && (
                                                                <i className={`bi ${child.icon}`} aria-hidden="true" style={{ fontSize: '14px' }} />
                                                            )}
                                                            <span className="sidebar-link-label">{child.label}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Lien normal (sans dropdown)
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `sidebar-link${isActive ? " active" : ""} mb-2`
                                        }
                                        onClick={handleNavigationClick}
                                    >
                                        {item.icon ? (
                                            <i
                                                className={`sidebar-link-icon bi ${item.icon}`}
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        <span className="sidebar-link-label">
                                            {item.label}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-account mb-3">
                    <button
                        type="button"
                        className="sidebar-account-trigger"
                        onClick={() =>
                            setProfileMenuOpen((current) => !current)
                        }
                        aria-expanded={profileMenuOpen}
                        aria-haspopup="menu"
                        aria-controls="sidebar-account-menu"
                        aria-label="Ouvrir le menu du compte"
                    >
                        <span
                            className="sidebar-account-avatar"
                            aria-hidden="true"
                        >
                            <i className="bi bi-person-circle" />
                        </span>
                        <span className="sidebar-account-copy">
                            <strong translate="no">{accountLabel}</strong>
                            <span>{user?.role ?? "Sans rôle"}</span>
                        </span>
                        <i
                            className={`bi ${profileMenuOpen ? "bi-chevron-down" : "bi-chevron-right"}`}
                            aria-hidden="true"
                        />
                    </button>

                    {profileMenuOpen ? (
                        <div
                            id="sidebar-account-menu"
                            className="sidebar-account-menu"
                            role="menu"
                        >
                            {canAccessSettings ? (
                                <button
                                    type="button"
                                    className="sidebar-account-action"
                                    onClick={() =>
                                        handleAccountNavigation(
                                            "/settings",
                                        )
                                    }
                                    role="menuitem"
                                >
                                    <i
                                        className="bi bi-person-gear"
                                        aria-hidden="true"
                                    />
                                    <span>Mon compte</span>
                                </button>
                            ) : null}
                            <button
                                type="button"
                                className="sidebar-account-action"
                                onClick={() => void handleSignOut()}
                                role="menuitem"
                            >
                                <i
                                    className="bi bi-box-arrow-right"
                                    aria-hidden="true"
                                />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            </aside>
        </>
    );
}