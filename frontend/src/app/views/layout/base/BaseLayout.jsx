import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../navbar/Navbar'
import { Sidebar } from '../sidebar/Sidebar'

export function BaseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth >= 992
  })

  return (
    <div className={`app-shell${sidebarOpen ? ' sidebar-open' : ' sidebar-closed'}`}>
      <Navbar isSidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((current) => !current)} />
      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen((current) => !current)}
        />
        <div className="app-main">
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
