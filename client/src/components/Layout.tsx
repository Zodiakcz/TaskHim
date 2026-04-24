import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '@/lib/user'
import type { ReactNode } from 'react'

const tabs = [
  { to: '/', label: 'Úkoly', icon: '✓', exact: true },
  { to: '/history', label: 'Historie', icon: '◷' },
  { to: '/shopping', label: 'Nákup', icon: '🛒' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { userName } = useUser()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="font-bold text-white text-lg hover:text-indigo-400 transition-colors">TaskHim</button>
        <button
          onClick={() => navigate('/change-password')}
          className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
        >
          {userName}
        </button>
      </header>

      {/* Main content — extra bottom padding so content clears the fixed tab bar */}
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full px-4 pt-4">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur border-t border-white/10 flex">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </NavLink>
        ))}
        <NavLink
          to="/tasks/new"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-bold transition-colors ${
              isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`
          }
        >
          <span className="text-xl leading-none">＋</span>
          Nový
        </NavLink>
      </nav>
    </div>
  )
}
