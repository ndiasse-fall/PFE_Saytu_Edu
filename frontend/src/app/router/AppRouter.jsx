import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../core/context/useAuth";
import { AuthGuard } from "../core/guards/AuthGuard";
import { GuestGuard } from "../core/guards/GuestGuard";
import { RoleGuard } from "../core/guards/RoleGuard";
import { getDashboardPath } from "../util/roleNavigation";
import { BaseLayout } from "../views/layout/base/BaseLayout";

const LoginPage = lazy(() => import("../views/pages/auth/login/LoginPage").then((module) => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import("../views/pages/auth/forgot-password/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../views/pages/auth/reset-password/ResetPasswordPage").then((module) => ({ default: module.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import("../views/pages/auth/change-password/ChangePasswordPage").then((module) => ({ default: module.ChangePasswordPage })));
const DashboardPage = lazy(() => import("../views/pages/gestion-admin/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const UserManagementPage = lazy(() => import("../views/pages/gestion-admin/users/UserManagementPage").then((module) => ({ default: module.UserManagementPage })));
const EleveManagementPage = lazy(() => import("../views/pages/gestion-admin/eleves/EleveManagementPage").then((module) => ({ default: module.EleveManagementPage })));
const EleveDetailsPage = lazy(() => import("../views/pages/gestion-admin/eleves/details/EleveDetailsPage").then((module) => ({ default: module.EleveDetailsPage })));
const TeacherManagementPage = lazy(() => import("../views/pages/gestion-admin/professeurs/TeacherManagementPage").then((module) => ({ default: module.TeacherManagementPage })));
const ClasseManagementPage = lazy(() => import("../views/pages/gestion-admin/Classes/ClasseManagementPage").then((module) => ({ default: module.ClasseManagementPage })));
const MatiereManagementPage = lazy(() => import("../views/pages/gestion-admin/matieres/MatiereManagementPage").then((module) => ({ default: module.MatiereManagementPage })));
const AffectationManagementPage = lazy(() => import("../views/pages/gestion-admin/affectations/AffectationManagementPage").then((module) => ({ default: module.AffectationManagementPage })));
const EmploiDuTempsPage = lazy(() => import("../views/pages/gestion-admin/emplois-du-temps/EmploiDuTempsPage").then((module) => ({ default: module.EmploiDuTempsPage })));
const AbsenceManagementPage = lazy(() => import("../views/pages/gestion-admin/absences/AbsenceManagementPage").then((module) => ({ default: module.AbsenceManagementPage })));
const SettingsPage = lazy(() => import("../views/pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const NotFoundPage = lazy(() => import("../views/pages/system/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ModulePlaceholderPage = lazy(() => import("../views/pages/system/ModulePlaceholderPage").then((module) => ({ default: module.ModulePlaceholderPage })));
const UnauthorizedPage = lazy(() => import("../views/pages/system/UnauthorizedPage").then((module) => ({ default: module.UnauthorizedPage || module.default })));
const BulletinList = lazy(() => import("../views/pages/gestion-admin/bulletins/BulletinList").then((module) => ({ default: module.BulletinList || module.default })));
const BulletinDetails = lazy(() => import("../views/pages/gestion-admin/bulletins/BulletinDetail").then((module) => ({ default: module.BulletinDetails || module.default })));
const MesNotes = lazy(() => import("../views/pages/gestion-admin/eleves/espace-eleve/MesNotes").then((module) => ({ default: module.MesNotes || module.default })));
const MesAbsences = lazy(() => import("../views/pages/gestion-admin/eleves/espace-eleve/MesAbsences").then((module) => ({ default: module.MesAbsences || module.default })));
const MonBulletin = lazy(() => import("../views/pages/gestion-admin/eleves/espace-eleve/MonBulletin").then((module) => ({ default: module.MonBulletin || module.default })));
const MonEmploiTempsEleve = lazy(() => import("../views/pages/gestion-admin/eleves/espace-eleve/MonEmploiTemps").then((module) => ({ default: module.MonEmploiTemps || module.default })));
const MonEmploiTempsProfesseur = lazy(() => import("../views/pages/gestion-admin/professeurs/espace-professeur/MonEmploiTemps").then((module) => ({ default: module.MonEmploiTemps || module.default })));
const NoteList = lazy(() => import("../views/pages/gestion-admin/notes/NoteList").then((module) => ({ default: module.NoteList || module.default })));
const EleveNotesDetailPage = lazy(() => import("../views/pages/gestion-admin/notes/EleveNotesDetailPage"));
const ClasseResultsPage = lazy(() => import("../views/pages/gestion-admin/notes/ClasseResultsPage"));

function RoleHomeRedirect() {
    const { user } = useAuth();
    return <Navigate to={getDashboardPath(user?.role)} replace />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="screen-state">Chargement de la page...</div>}>
                <Routes>
                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    <Route element={<AuthGuard />}>
                        <Route path="/change-password" element={<ChangePasswordPage />} />

                        <Route element={<BaseLayout />}>
                            <Route path="/" element={<RoleHomeRedirect />} />
                            <Route path="/user/dashboard" element={<RoleHomeRedirect />} />
                            <Route path="/settings" element={<SettingsPage />} />

                            <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN"]} />}>
                                <Route path="/admin/dashboard" element={<DashboardPage />} />
                                <Route path="/admin/classes" element={<ModulePlaceholderPage title="Classes" />} />
                                <Route path="/admin/emploi-du-temps" element={<EmploiDuTempsPage />} />
                                <Route path="/admin/bulletins" element={<BulletinList />} />
                                <Route path="/admin/bulletins/:id" element={<BulletinDetails />} />
                                <Route path="/admin/users" element={<UserManagementPage />} />
                                <Route path="/admin/eleves" element={<EleveManagementPage />} />
                                <Route path="/admin/gestion-admin/eleves/:id" element={<EleveDetailsPage />} />
                                <Route path="/admin/professeurs" element={<TeacherManagementPage />} />
                                <Route path="/admin/gestion-admin/classes" element={<ClasseManagementPage />} />
                                <Route path="/admin/gestion-admin/matieres" element={<MatiereManagementPage />} />
                                <Route path="/admin/gestion-admin/affectations" element={<AffectationManagementPage />} />
                                <Route path="/admin/gestion-admin/users" element={<Navigate to="/admin/users" replace />} />
                                <Route path="/admin/gestion-admin/eleves" element={<Navigate to="/admin/eleves" replace />} />
                                <Route path="/admin/gestion-admin/professeurs" element={<Navigate to="/admin/professeurs" replace />} />
                            </Route>

                            <Route element={<RoleGuard roles={["ENSEIGNANT"]} />}>
                                <Route path="/enseignant/dashboard" element={<DashboardPage />} />
                                <Route path="/enseignant/eleves" element={<ModulePlaceholderPage title="Élèves" />} />
                                <Route path="/enseignant/classes" element={<ModulePlaceholderPage title="Classes" />} />
                                <Route path="/enseignant/emploi-du-temps" element={<MonEmploiTempsProfesseur />} />
                                <Route path="/enseignant/bulletins" element={<ModulePlaceholderPage title="Bulletin" />} />
                                <Route path="/professeur/emploi-du-temps" element={<Navigate to="/enseignant/emploi-du-temps" replace />} />
                            </Route>

                            <Route element={<RoleGuard roles={["SUPER_ADMIN", "ADMIN", "ENSEIGNANT"]} />}>
                                <Route path="/notes" element={<NoteList />} />
                                <Route path="/notes/resultats/classe/:classeId" element={<ClasseResultsPage />} />
                                <Route path="/notes/:eleveId" element={<EleveNotesDetailPage />} />
                                <Route path="/absences" element={<AbsenceManagementPage />} />
                            </Route>

                            <Route element={<RoleGuard roles={["ELEVE"]} />}>
                                <Route path="/eleve/dashboard" element={<DashboardPage />} />
                                <Route path="/eleve/notes" element={<MesNotes />} />
                                <Route path="/eleve/absences" element={<MesAbsences />} />
                                <Route path="/eleve/bulletin" element={<MonBulletin />} />
                                <Route path="/eleve/emploi-du-temps" element={<MonEmploiTempsEleve />} />
                            </Route>

                            <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
