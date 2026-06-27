import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "../core/guards/AuthGuard";
import { GuestGuard } from "../core/guards/GuestGuard";
import { RoleGuard } from "../core/guards/RoleGuard";
import { useAuth } from "../core/context/useAuth";
import { getDashboardPath } from "../util/roleNavigation";
import { BaseLayout } from "../views/layout/base/BaseLayout";

// ... (Gardez tous vos imports lazy tels quels)

function RoleHomeRedirect() {
    const { user } = useAuth();
    return <Navigate to={getDashboardPath(user?.role)} replace />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="screen-state">Chargement de la page...</div>}>
                <Routes>
                    {/* Public / Guest Routes */}
                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    {/* Authenticated Routes */}
                    <Route element={<AuthGuard />}>
                        <Route path="/change-password" element={<ChangePasswordPage />} />
                        
                        <Route element={<BaseLayout />}>
                            {/* HOME REDIRECTS */}
                            <Route path="/" element={<RoleHomeRedirect />} />
                            <Route path="/user/dashboard" element={<RoleHomeRedirect />} />
                            <Route path="/settings" element={<SettingsPage />} />

                            {/* ADMIN ROUTES */}
                            <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN"]} />}>
                                <Route path="/admin/dashboard" element={<DashboardPage />} />
                                <Route path="/admin/eleves" element={<ModulePlaceholderPage title="Élèves" />} />
                                <Route path="/admin/professeurs" element={<TeacherManagementPage />} />
                                <Route path="/admin/classes" element={<ModulePlaceholderPage title="Classes" />} />
                                <Route path="/admin/emploi-du-temps" element={<EmploiDuTempsPage />} />
                                <Route path="/admin/bulletins" element={<BulletinList />} />
                                <Route path="/admin/gestion-admin/users" element={<UserManagementPage />} />
                                <Route path="/admin/gestion-admin/eleves" element={<EleveManagementPage />} />
                                <Route path="/admin/gestion-admin/eleves/:id" element={<EleveDetailsPage />} />
                                <Route path="/admin/gestion-admin/professeurs" element={<TeacherManagementPage />} />
                            </Route>

                            {/* ENSEIGNANT ROUTES */}
                            <Route element={<RoleGuard roles={["ENSEIGNANT"]} />}>
                                <Route path="/enseignant/dashboard" element={<DashboardPage />} />
                                <Route path="/enseignant/eleves" element={<ModulePlaceholderPage title="Élèves" />} />
                                <Route path="/enseignant/classes" element={<ModulePlaceholderPage title="Classes" />} />
                                <Route path="/enseignant/emploi-du-temps" element={<EmploiDuTempsPage />} />
                                <Route path="/enseignant/bulletins" element={<ModulePlaceholderPage title="Bulletin" />} />
                            </Route>

                            {/* ELEVE ROUTES */}
                            <Route element={<RoleGuard roles={["ELEVE"]} />}>
                                <Route path="/eleve/dashboard" element={<DashboardPage />} />
                                <Route path="/eleve/notes" element={<MesNotes />} />
                                <Route path="/eleve/absences" element={<MesAbsences />} />
                                <Route path="/eleve/bulletin" element={<MonBulletin />} />
                                <Route path="/eleve/emploi-du-temps" element={<MonEmploiTemps />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Catch-all 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}