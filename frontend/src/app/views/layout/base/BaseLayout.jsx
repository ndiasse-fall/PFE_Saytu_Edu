import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../navbar/Navbar'
import { Sidebar } from '../sidebar/Sidebar'

export function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar isSidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((current) => !current)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
