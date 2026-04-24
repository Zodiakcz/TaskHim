import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user'
import type { Task } from '@/lib/types'
import { LOCATION_LABELS, EFFORT_LABELS, PRIORITY_LABELS, RECURRENCE_UNIT_LABELS } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userName } = useUser()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completionNote, setCompletionNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      setTask(await api.task(Number(id)))
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleComplete() {
    if (completing) return
    setCompleting(true)
    try {
      await api.completeTask(Number(id), completionNote || undefined)
      await load()
      setShowNoteInput(false)
      setCompletionNote('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setCompleting(false)
    }
  }

  async function handleToggleSubtask(subtaskId: number, checked: boolean) {
    await api.toggleSubtask(Number(id), subtaskId, checked)
    await load()
  }

  async function handleDelete() {
    if (!confirm('Opravdu smazat úkol? Tato akce je nevratná.')) return
    setDeleting(true)
    try {
      await api.deleteTask(Number(id))
      navigate('/')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
      setDeleting(false)
    }
  }

  if (loading) return <div className="text-zinc-500 py-8 text-center">Načítání...</div>
  if (!task) return null

  const isDone = task.status === 'HOTOVY'
  const isRecurring = task.recurrenceInterval !== null

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors text-sm font-medium"
      >
        ← Všechny úkoly
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white leading-snug">{task.title}</h1>
          {isDone && <span className="badge badge-green mt-1">Hotový</span>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            className="btn-ghost text-xs"
          >
            Upravit
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger text-xs">
            Smazat
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="card p-4 space-y-3 text-sm">
        <Row label="Lokace" value={LOCATION_LABELS[task.location]} />
        <Row label="Náročnost" value={EFFORT_LABELS[task.effort]} />
        <Row label="Priorita" value={PRIORITY_LABELS[task.priority]} />
        {task.dueDate && <Row label="Termín" value={formatDate(task.dueDate)} />}
        {isRecurring && (
          <Row
            label="Opakování"
            value={`každých ${task.recurrenceInterval} ${RECURRENCE_UNIT_LABELS[task.recurrenceUnit!]} po dokončení`}
          />
        )}
        {task.notes && <Row label="Poznámka" value={task.notes} />}
        <Row label="Vytvořil" value={`${task.createdBy} · ${formatDate(task.createdAt)}`} />
      </div>

      {/* Subtasks */}
      {task.subtasks.length > 0 && (
        <div className="card p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Podúkoly</p>
          {task.subtasks.map((s) => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={s.checked}
                onChange={(e) => handleToggleSubtask(s.id, e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-500"
              />
              <span className={`text-sm ${s.checked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                {s.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Complete button */}
      {!isDone && (
        <div className="space-y-3">
          {showNoteInput ? (
            <div className="space-y-2">
              <input
                className="form-input"
                placeholder="Volitelná poznámka k dokončení..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleComplete} disabled={completing} className="btn-success flex-1 py-3">
                  {completing ? 'Ukládám...' : isRecurring ? '↻ Hotovo (přeplánovat)' : '✓ Hotovo'}
                </button>
                <button onClick={() => setShowNoteInput(false)} className="btn-secondary">
                  Zrušit
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-success flex-1 py-4 text-base"
              >
                {completing ? 'Ukládám...' : isRecurring ? '↻ Hotovo' : '✓ Hotovo'}
              </button>
              <button
                onClick={() => setShowNoteInput(true)}
                className="btn-secondary px-3"
                title="Přidat poznámku"
              >
                ✏
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion history */}
      {task.completions && task.completions.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Historie dokončení</p>
          <div className="space-y-2">
            {task.completions.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <span className="text-zinc-400 font-medium shrink-0">{c.userName}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500 shrink-0">{formatDateTime(c.completedAt)}</span>
                {c.note && <span className="text-zinc-400 italic">„{c.note}"</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-zinc-500 w-24 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-zinc-200 text-sm">{value}</span>
    </div>
  )
}
