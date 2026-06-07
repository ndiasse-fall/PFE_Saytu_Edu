import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from '../core/guards/AuthGuard'
import { GuestGuard } from '../core/guards/GuestGuard'
import { RoleGuard } from '../core/guards/RoleGuard'
import { BaseLayout } from '../views/layout/base/BaseLayout'
import { LoginPage } from '../views/pages/auth/login/LoginPage'
import { DashboardPage } from '../views/pages/gestion-admin/dashboard/DashboardPage'
import { UserManagementPage } from '../views/pages/gestion-admin/users/UserManagementPage'
import { SettingsPage } from '../views/pages/settings/SettingsPage'
import { NotFoundPage } from '../views/pages/system/NotFoundPage'
import { UnauthorizedPage } from '../views/pages/system/UnauthorizedPage'

export function AppRouter() {
  return (
    <BrowserRouter>
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
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            <Route path="/user/dashboard" element={<DashboardPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
