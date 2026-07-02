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
    const ForgotPasswordPage = lazy(() =>
        import("../views/pages/auth/forgot-password/ForgotPasswordPage").then(
            (module) => ({ default: module.ForgotPasswordPage }),
        ),
    );
    const ResetPasswordPage = lazy(() =>
        import("../views/pages/auth/reset-password/ResetPasswordPage").then(
            (module) => ({ default: module.ResetPasswordPage }),
        ),
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
    
    const TeacherManagementPage = lazy(() =>
        import("../views/pages/gestion-admin/professeurs/TeacherManagementPage").then(
            (module) => ({ default: module.TeacherManagementPage }),
        ),
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
    
    import ResultatsClasse from "../views/pages/gestion-admin/note/ResultatsClasse";
    
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
                            <Route
                                path="/forgot-password"
                                element={<ForgotPasswordPage />}
                            />
                            <Route
                                path="/reset-password"
                                element={<ResetPasswordPage />}
                            />
                        </Route>
    
                        {/* AUTH */}
                        <Route element={<AuthGuard />}>
                            <Route element={<BaseLayout />}>
    
                                {/* HOME */}
                                <Route path="/" element={<RoleHomeRedirect />} />
                                <Route path="/user/dashboard" element={<RoleHomeRedirect />} />
    
                                <Route path="/settings" element={<SettingsPage />} />
    
                                {/* ADMIN */}
                                <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN"]} />}>
                                    <Route path="/admin/dashboard" element={<DashboardPage />} />
    
                                    {/* Gestion Admin */}
                                    <Route
                                        path="/admin/gestion-admin/users"
                                        element={<UserManagementPage />}
                                    />
                                    <Route
                                        path="/admin/eleves"
                                        element={<EleveManagementPage />}
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
                                        path="/admin/gestion-admin/professeurs"
                                        element={<TeacherManagementPage />}
                                    />
    
                                    {/* Modules */}
                                    <Route
                                        path="/admin/professeurs"
                                        element={<TeacherManagementPage />}
                                    />
                                    <Route
                                        path="/admin/classes"
                                        element={<ModulePlaceholderPage title="Classes" />}
                                    />
                                    <Route
                                        path="/admin/emploi-du-temps"
                                        element={<ModulePlaceholderPage title="Emploi du temps" />}
                                    />
                                    <Route
                                        path="/admin/bulletins"
                                        element={<ModulePlaceholderPage title="Bulletin" />}
                                    />
                                </Route>
    
                                {/* NOTES (ADMIN & ENSEIGNANT) */}
                                <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN",
  "ENSEIGNANT"]} />}>
                                    <Route path="/notes" element={<ResultatsClasse />} />
                              
                                    <Route
                                        path="/notes/resultats/classe"
                                        element={<ResultatsClasse />}
                                    />
                                </Route>
    
                                {/* ENSEIGNANT */}
                                <Route element={<RoleGuard roles={["ENSEIGNANT"]} />}>
                                    <Route path="/enseignant/dashboard" element={<DashboardPage />} />
                                </Route>
    
                                {/* ELEVE */}
                                <Route element={<RoleGuard roles={["ELEVE"]} />}>
                                    <Route path="/eleve/dashboard" element={<DashboardPage />} />
                                    <Route path="/eleve/emploi-du-temps"
  element={<ModulePlaceholderPage title="Mon Emploi du temps" />} />
                                    <Route path="/eleve/bulletin" element={<ModulePlaceholderPage
  title="Mon Bulletin" />} />
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