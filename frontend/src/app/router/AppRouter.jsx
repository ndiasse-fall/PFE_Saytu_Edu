import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "../core/guards/AuthGuard";
import { GuestGuard } from "../core/guards/GuestGuard";
import { RoleGuard } from "../core/guards/RoleGuard";
import { useAuth } from "../core/context/useAuth";
import { getDashboardPath } from "../util/roleNavigation";
import { BaseLayout } from "../views/layout/base/BaseLayout";

const LoginPage = lazy(() =>
    import("../views/pages/auth/login/LoginPage").then((module) => ({
        default: module.LoginPage,
    })),
);
const DashboardPage = lazy(() =>
    import("../views/pages/gestion-admin/dashboard/DashboardPage").then(
        (module) => ({ default: module.DashboardPage }),
    ),
);
const UserManagementPage = lazy(() =>
    import("../views/pages/gestion-admin/users/UserManagementPage").then(
        (module) => ({ default: module.UserManagementPage }),
    ),
);
const EleveManagementPage = lazy(() =>
    import("../views/pages/gestion-admin/eleves/EleveManagementPage").then(
        (module) => ({ default: module.EleveManagementPage }),
    ),
);
const EleveDetailsPage = lazy(() =>
    import("../views/pages/gestion-admin/eleves/details/EleveDetailsPage").then(
        (module) => ({ default: module.EleveDetailsPage }),
    ),
);
const SettingsPage = lazy(() =>
    import("../views/pages/settings/SettingsPage").then((module) => ({
        default: module.SettingsPage,
    })),
);
const NotFoundPage = lazy(() =>
    import("../views/pages/system/NotFoundPage").then((module) => ({
        default: module.NotFoundPage,
    })),
);
const UnauthorizedPage = lazy(() =>
    import("../views/pages/system/UnauthorizedPage").then((module) => ({
        default: module.UnauthorizedPage,
    })),
);
const ModulePlaceholderPage = lazy(() =>
    import("../views/pages/system/ModulePlaceholderPage").then((module) => ({
        default: module.ModulePlaceholderPage,
    })),
);
const BulletinList = lazy(() =>
    import("../views/pages/gestion-admin/bulletins/BulletinList"),
);

const MesNotes = lazy(() =>
    import("../views/pages/gestion-admin/eleves/espace-eleve/MesNotes").then(
        (module) => ({ default: module.MesNotes }),
    ),
);
const MesAbsences = lazy(() =>
    import(
        "../views/pages/gestion-admin/eleves/espace-eleve/MesAbsences"
    ).then((module) => ({ default: module.MesAbsences })),
);
const MonBulletin = lazy(() =>
    import(
        "../views/pages/gestion-admin/eleves/espace-eleve/MonBulletin"
    ).then((module) => ({ default: module.MonBulletin })),
);
const MonEmploiTemps = lazy(() =>
    import(
        "../views/pages/gestion-admin/eleves/espace-eleve/MonEmploiTemps"
    ).then((module) => ({ default: module.MonEmploiTemps })),
);

function RoleHomeRedirect() {
    const { user } = useAuth();

    return <Navigate to={getDashboardPath(user?.role)} replace />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense
                fallback={
                    <div className="screen-state">Chargement de la page...</div>
                }
            >
                <Routes>
                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>

                    <Route element={<AuthGuard />}>
                        <Route element={<BaseLayout />}>
                            <Route path="/" element={<RoleHomeRedirect />} />
                            <Route
                                path="/user/dashboard"
                                element={<RoleHomeRedirect />}
                            />

                            <Route
                                element={
                                    <RoleGuard
                                        roles={["SUPER_ADMIN", "ADMIN"]}
                                    />
                                }
                            >
                                <Route
                                    path="/admin/dashboard"
                                    element={<DashboardPage />}
                                />
                                <Route
                                    path="/admin/eleves"
                                    element={
                                        <ModulePlaceholderPage title="Élèves" />
                                    }
                                />
                                <Route
                                    path="/admin/professeurs"
                                    element={
                                        <ModulePlaceholderPage title="Professeurs" />
                                    }
                                />
                                <Route
                                    path="/admin/classes"
                                    element={
                                        <ModulePlaceholderPage title="Classes" />
                                    }
                                />
                                <Route
                                    path="/admin/emploi-du-temps"
                                    element={
                                        <ModulePlaceholderPage title="Emploi du temps" />
                                    }
                                />
                                <Route
                                    path="/admin/bulletins"
                                    element={<BulletinList />}
                                />
                                <Route
                                    path="/admin/gestion-admin/users"
                                    element={<UserManagementPage />}
                                />
                                <Route
                                    path="/admin/gestion-admin/eleves"
                                    element={<EleveManagementPage />}
                                />
                                <Route
                                    path="/admin/gestion-admin/eleves/:id"
                                    element={<EleveDetailsPage />}
                                />
                                <Route
                                    path="/admin/settings"
                                    element={<SettingsPage />}
                                />
                            </Route>

                            <Route
                                element={<RoleGuard roles={["ENSEIGNANT"]} />}
                            >
                                <Route
                                    path="/enseignant/dashboard"
                                    element={<DashboardPage />}
                                />
                                <Route
                                    path="/enseignant/eleves"
                                    element={
                                        <ModulePlaceholderPage title="Élèves" />
                                    }
                                />
                                <Route
                                    path="/enseignant/classes"
                                    element={
                                        <ModulePlaceholderPage title="Classes" />
                                    }
                                />
                                <Route
                                    path="/enseignant/emploi-du-temps"
                                    element={
                                        <ModulePlaceholderPage title="Emploi du temps" />
                                    }
                                />
                                <Route
                                    path="/enseignant/bulletins"
                                    element={
                                        <ModulePlaceholderPage title="Bulletin" />
                                    }
                                />
                            </Route>

                            <Route element={<RoleGuard roles={["ELEVE"]} />}>
                                <Route
                                    path="/eleve/dashboard"
                                    element={<DashboardPage />}
                                />
                                <Route
                                    path="/eleve/notes"
                                    element={<MesNotes />}
                                />
                                <Route
                                    path="/eleve/absences"
                                    element={<MesAbsences />}
                                />
                                <Route
                                    path="/eleve/bulletin"
                                    element={<MonBulletin />}
                                />
                                <Route
                                    path="/eleve/emploi-du-temps"
                                    element={<MonEmploiTemps />}
                                />
                            </Route>

                            <Route
                                path="/unauthorized"
                                element={<UnauthorizedPage />}
                            />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}