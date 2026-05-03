import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, LayoutDashboard, Zap, Settings, FileText, LogOut } from 'lucide-react'
import { authAPI } from '../services/api.js'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attack',    icon: Zap,             label: 'Attack Sim'  },
  { to: '/security',  icon: Settings,        label: 'Security'    },
  { to: '/logs',      icon: FileText,        label: 'Logs'        },
]

export default function Layout() {
  const navigate = useNavigate()

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const username = localStorage.getItem('username') || 'admin'

  return (
    <div className="flex h-screen noise-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-cyber-border bg-cyber-panel z-10">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-cyber-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center">
              <Shield size={16} className="text-cyber-accent" />
            </div>
            <div>
              <div className="text-cyber-bright text-sm font-display font-semibold">SecureAuth</div>
              <div className="text-cyber-border text-xs font-mono">Lab v1.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display transition-all duration-150 ${
                  isActive
                    ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20'
                    : 'text-cyber-text hover:text-cyber-bright hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-cyber-border">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-cyber-bg mb-1">
            <div className="w-6 h-6 rounded-full bg-cyber-accent/20 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent text-xs font-bold">
              {username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-cyber-bright text-xs font-display font-medium">{username}</div>
              <div className="text-cyber-border text-xs font-mono">ADMIN</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cyber-text hover:text-cyber-red hover:bg-cyber-red/10 transition-colors font-display"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
