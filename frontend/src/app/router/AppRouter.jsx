import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from '../core/guards/AuthGuard'
import { GuestGuard } from '../core/guards/GuestGuard'
import { RoleGuard } from '../core/guards/RoleGuard'
import { BaseLayout } from '../views/layout/base/BaseLayout'

const LoginPage = lazy(() => import('../views/pages/auth/login/LoginPage')
  .then((module) => ({ default: module.LoginPage })))
const DashboardPage = lazy(() => import('../views/pages/gestion-admin/dashboard/DashboardPage')
  .then((module) => ({ default: module.DashboardPage })))
const UserManagementPage = lazy(() => import('../views/pages/gestion-admin/users/UserManagementPage')
  .then((module) => ({ default: module.UserManagementPage })))
const EleveManagementPage = lazy(() => import('../views/pages/gestion-admin/eleves/EleveManagementPage')
  .then((module) => ({ default: module.EleveManagementPage })))
const SettingsPage = lazy(() => import('../views/pages/settings/SettingsPage')
  .then((module) => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('../views/pages/system/NotFoundPage')
  .then((module) => ({ default: module.NotFoundPage })))
const UnauthorizedPage = lazy(() => import('../views/pages/system/UnauthorizedPage')
  .then((module) => ({ default: module.UnauthorizedPage })))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="screen-state">Chargement de la page...</div>}>
        <Routes>
          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<BaseLayout />}>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

              <Route element={<RoleGuard roles={['SUPER_ADMIN', 'ADMIN']} />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/gestion-admin/users" element={<UserManagementPage />} />
                <Route path="/admin/gestion-admin/eleves" element={<EleveManagementPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
              </Route>

              <Route path="/user/dashboard" element={<DashboardPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
