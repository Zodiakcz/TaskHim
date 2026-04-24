import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Completion, Stats } from '@/lib/types'
import { EFFORT_LABELS, LOCATION_LABELS } from '@/lib/types'

type Window = 'thisWeek' | 'thisMonth' | 'allTime'

const WINDOW_LABELS: Record<Window, string> = {
  thisWeek: 'Tento týden',
  thisMonth: 'Tento měsíc',
  allTime: 'Celkem',
}

const USERS = ['Dave', 'Anna']

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function History() {
  const [completions, setCompletions] = useState<Completion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [window, setWindow] = useState<Window>('thisWeek')
  const [userFilter, setUserFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.completions(), api.stats()])
      .then(([c, s]) => { setCompletions(c); setStats(s) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = userFilter ? completions.filter((c) => c.userName === userFilter) : completions
  const currentStats = stats?.[window] ?? {}

  if (loading) return <div className="text-zinc-500 py-8 text-center">Načítání...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Historie</h1>

      {/* Leaderboard */}
      <div className="card p-4 space-y-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Žebříček</p>

        {/* Window selector */}
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {(Object.entries(WINDOW_LABELS) as [Window, string][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setWindow(k)}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                window === k ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          {USERS.map((name) => {
            const s = currentStats[name] ?? { count: 0, points: 0 }
            return (
              <div key={name} className="bg-zinc-800/60 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-zinc-200 mb-1">{name}</p>
                <p className="text-3xl font-bold text-indigo-400">{s.points}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.count} úkolů</p>
              </div>
            )
          })}
        </div>

        {/* Score legend */}
        <div className="flex gap-3 text-xs text-zinc-600 justify-center">
          <span>Krátké = 1b</span>
          <span>·</span>
          <span>Střední = 3b</span>
          <span>·</span>
          <span>Dlouhé = 8b</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setUserFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !userFilter ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'
          }`}
        >
          Všichni
        </button>
        {USERS.map((name) => (
          <button
            key={name}
            onClick={() => setUserFilter(userFilter === name ? '' : name)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              userFilter === name ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Completions list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">Žádná dokončení</p>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">{c.task?.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-500">{c.task ? LOCATION_LABELS[c.task.location] : ''}</span>
                    {c.task && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-500">{EFFORT_LABELS[c.task.effort]}</span>
                      </>
                    )}
                    {c.note && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-zinc-400 italic">„{c.note}"</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-zinc-300">{c.userName}</p>
                  <p className="text-xs text-zinc-500">{formatDateTime(c.completedAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
