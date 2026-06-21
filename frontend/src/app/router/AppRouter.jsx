import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthGuard } from "../core/guards/AuthGuard";
import { GuestGuard } from "../core/guards/GuestGuard";
import { RoleGuard } from "../core/guards/RoleGuard";
import { useAuth } from "../core/context/useAuth";
import { getDashboardPath } from "../util/roleNavigation";
import { BaseLayout } from "../views/layout/base/BaseLayout";

/* ===================== PAGES ===================== */

const LoginPage = lazy(() =>
    import("../views/pages/auth/login/LoginPage").then((m) => ({
        default: m.LoginPage,
    }))
);

const DashboardPage = lazy(() =>
    import("../views/pages/gestion-admin/dashboard/DashboardPage").then((m) => ({
        default: m.DashboardPage,
    }))
);

const UserManagementPage = lazy(() =>
    import("../views/pages/gestion-admin/users/UserManagementPage").then((m) => ({
        default: m.UserManagementPage,
    }))
);

const EleveManagementPage = lazy(() =>
    import("../views/pages/gestion-admin/eleves/EleveManagementPage").then((m) => ({
        default: m.EleveManagementPage,
    }))
);

const EleveDetailsPage = lazy(() =>
    import("../views/pages/gestion-admin/eleves/details/EleveDetailsPage").then((m) => ({
        default: m.EleveDetailsPage,
    }))
);

const SettingsPage = lazy(() =>
    import("../views/pages/settings/SettingsPage").then((m) => ({
        default: m.SettingsPage,
    }))
);

const NotFoundPage = lazy(() =>
    import("../views/pages/system/NotFoundPage").then((m) => ({
        default: m.NotFoundPage,
    }))
);

const UnauthorizedPage = lazy(() =>
    import("../views/pages/system/UnauthorizedPage").then((m) => ({
        default: m.UnauthorizedPage,
    }))
);

const ModulePlaceholderPage = lazy(() =>
    import("../views/pages/system/ModulePlaceholderPage").then((m) => ({
        default: m.ModulePlaceholderPage,
    }))
);

/* ===================== NOTES ===================== */

import NoteList from "../views/pages/gestion-admin/notes/NoteList";
import NoteCreate from "../views/pages/gestion-admin/notes/NoteCreate";
import NoteEdit from "../views/pages/gestion-admin/notes/NoteEdit";
import ResultatsClasse from "../views/pages/gestion-admin/notes/ResultatsClasse";
import ResultatsEleve from "../views/pages/gestion-admin/notes/ResultatsEleve";

/* ===================== REDIRECT ===================== */

function RoleHomeRedirect() {
    const { user } = useAuth();

    return <Navigate to={getDashboardPath(user?.role)} replace />;
}

/* ===================== ROUTER ===================== */

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Chargement de la page...</div>}>

                <Routes>

                    {/* LOGIN */}
                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>

                    {/* AUTH */}
                    <Route element={<AuthGuard />}>
                        <Route element={<BaseLayout />}>

                            {/* HOME */}
                            <Route path="/" element={<RoleHomeRedirect />} />
                            <Route path="/user/dashboard" element={<RoleHomeRedirect />} />

                            {/* ADMIN */}
                            <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN"]} />}>

                                <Route path="/admin/dashboard" element={<DashboardPage />} />

                                <Route path="/admin/eleves" element={<EleveManagementPage />} />
                                <Route path="/admin/gestion-admin/users" element={<UserManagementPage />} />
                                <Route path="/admin/gestion-admin/eleves/:id" element={<EleveDetailsPage />} />

                                <Route path="/admin/settings" element={<SettingsPage />} />

                                <Route path="/admin/professeurs" element={<ModulePlaceholderPage title="Professeurs" />} />
                                <Route path="/admin/classes" element={<ModulePlaceholderPage title="Classes" />} />
                                <Route path="/admin/emploi-du-temps" element={<ModulePlaceholderPage title="Emploi du temps" />} />
                                <Route path="/admin/bulletins" element={<ModulePlaceholderPage title="Bulletins" />} />

                                {/* NOTES (AJOUTÉ PROPREMENT ICI) */}
                                <Route path="/notes" element={<NoteList />} />
                                <Route path="/notes/create" element={<NoteCreate />} />
                                <Route path="/notes/edit/:id" element={<NoteEdit />} />
                                <Route path="/notes/resultats/classe" element={<ResultatsClasse />} />
                                <Route path="/notes/resultats/eleve" element={<ResultatsEleve />} />

                            </Route>

                            {/* ENSEIGNANT */}
                            <Route element={<RoleGuard roles={["ENSEIGNANT"]} />}>
                                <Route path="/enseignant/dashboard" element={<DashboardPage />} />
                            </Route>

                            {/* ELEVE */}
                            <Route element={<RoleGuard roles={["ELEVE"]} />}>
                                <Route path="/eleve/dashboard" element={<DashboardPage />} />
                            </Route>

                            {/* SYSTEM */}
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        </Route>
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />

                </Routes>

            </Suspense>
        </BrowserRouter>
    );
}