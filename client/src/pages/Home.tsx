import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user'
import { TaskCard } from '@/components/TaskCard'
import type { Task, Location, Effort, Priority } from '@/lib/types'
import { LOCATION_LABELS, EFFORT_LABELS, PRIORITY_ORDER } from '@/lib/types'

type FilterKey = Location | Effort | Priority | ''

function sortOtevrene(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const pd = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
    if (pd !== 0) return pd
    return new Date(a.activeSince).getTime() - new Date(b.activeSince).getTime()
  })
}

function sortPlanowane(tasks: Task[]) {
  return [...tasks].sort(
    (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  )
}

export function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [quickAdd, setQuickAdd] = useState('')
  const [adding, setAdding] = useState(false)
  const [planowane, setPlanowane] = useState(true)
  const [locationFilter, setLocationFilter] = useState<Location | ''>('')
  const { userName } = useUser()
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const load = useCallback(async () => {
    try {
      setTasks(await api.tasks())
    } catch {
      // silent on poll
    }
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 30_000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickAdd.trim() || adding) return
    setAdding(true)
    try {
      await api.createTask({ title: quickAdd.trim() })
      setQuickAdd('')
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setAdding(false)
    }
  }

  const otevrene = sortOtevrene(
    tasks.filter(
      (t) => !t.dueDate && (!locationFilter || t.location === locationFilter)
    )
  )
  const planned = sortPlanowane(
    tasks.filter(
      (t) => t.dueDate && (!locationFilter || t.location === locationFilter)
    )
  )

  const locations = Object.entries(LOCATION_LABELS) as [Location, string][]

  return (
    <div className="space-y-6">
      {/* Quick add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <input
          className="form-input flex-1"
          placeholder="Rychle přidat úkol..."
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          disabled={adding}
        />
        {quickAdd.trim() && (
          <button type="submit" className="btn-primary" disabled={adding}>
            Přidat
          </button>
        )}
      </form>

      {/* Location filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setLocationFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            locationFilter === ''
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'border-zinc-700 text-zinc-400 hover:text-white'
          }`}
        >
          Vše
        </button>
        {locations.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setLocationFilter(locationFilter === key ? '' : key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              locationFilter === key
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Otevřené section */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Otevřené
        </h2>
        {otevrene.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">Žádné otevřené úkoly</p>
        ) : (
          <div className="space-y-2">
            {otevrene.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </section>

      {/* Plánované section */}
      {planned.length > 0 && (
        <section>
          <button
            onClick={() => setPlanowane((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 w-full text-left"
          >
            <span>Plánované ({planned.length})</span>
            <span className="text-zinc-600">{planowane ? '▲' : '▼'}</span>
          </button>
          {planowane && (
            <div className="space-y-2">
              {planned.map((t) => <TaskCard key={t.id} task={t} />)}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
