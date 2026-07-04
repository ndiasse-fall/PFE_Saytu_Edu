import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../core/context/useAuth";
import { BrandLogo } from "../../../shared/components/branding/BrandLogo";
import { menuItems } from "../../../util/menu";

export function Sidebar({ isOpen, onClose, onToggle }) {
    const { user } = useAuth();
    
    // État pour gérer les dropdowns (support multiple)
    const [openDropdowns, setOpenDropdowns] = useState({});

    const sections = menuItems.filter((section) =>
        section.roles.includes(user?.role),
    );
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
                                if (item.isDropdown) {
                                    const isDropdownOpen = openDropdowns[item.label] || false;
                                    const dropdownId = `sidebar-dropdown-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

                                    return (
                                        <div key={item.label} className="sidebar-dropdown">
                                            <button
                                                type="button"
                                                className="sidebar-link sidebar-dropdown-trigger"
                                                onClick={() => toggleDropdown(item.label)}
                                                aria-expanded={isDropdownOpen}
                                                aria-controls={dropdownId}
                                            >
                                                <i className={`sidebar-link-icon bi ${item.icon}`} aria-hidden="true" />
                                                <span className="sidebar-link-label">
                                                    {item.label}
                                                </span>
                                                <i
                                                    className={`sidebar-dropdown-chevron bi ${isDropdownOpen ? "bi-chevron-down" : "bi-chevron-right"}`}
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            {isDropdownOpen && (
                                                <div id={dropdownId} className="sidebar-submenu">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.path}
                                                            to={child.path}
                                                            className={({ isActive }) =>
                                                                `sidebar-link sidebar-submenu-link${isActive ? " active" : ""}`
                                                            }
                                                            onClick={handleNavigationClick}
                                                        >
                                                            {child.icon && (
                                                                <i className={`sidebar-submenu-icon bi ${child.icon}`} aria-hidden="true" />
                                                            )}
                                                            <span className="sidebar-link-label">{child.label}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

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
            </aside>
        </>
    );
}
