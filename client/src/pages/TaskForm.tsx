import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Location, Effort, Priority, RecurrenceUnit } from '@/lib/types'
import { RECURRENCE_UNIT_LABELS } from '@/lib/types'

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sub?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-2 rounded-lg border text-sm font-medium transition-colors leading-tight ${
            value === opt.value
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {opt.label}
          {opt.sub && (
            <span className="block text-xs opacity-60 font-normal mt-0.5">{opt.sub}</span>
          )}
        </button>
      ))}
    </div>
  )
}

const LOCATION_OPTIONS: { value: Location; label: string }[] = [
  { value: 'DOMA', label: 'Doma' },
  { value: 'VENKU', label: 'Venku' },
  { value: 'EXTERNI', label: 'Externí' },
]

const EFFORT_OPTIONS: { value: Effort; label: string; sub: string }[] = [
  { value: 'KRATKE', label: 'Krátké', sub: '1–2 hod.' },
  { value: 'STREDNI', label: 'Střední', sub: '2–4 hod.' },
  { value: 'DLOUHE', label: 'Dlouhé', sub: '4+ hod.' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NIZKA', label: 'Nízká' },
  { value: 'NORMALNI', label: 'Normální' },
  { value: 'VYSOKA', label: 'Vysoká' },
]

function toDateInputValue(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toISOString().split('T')[0]
}

export function TaskForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState<Location>('DOMA')
  const [effort, setEffort] = useState<Effort>('STREDNI')
  const [priority, setPriority] = useState<Priority>('NORMALNI')
  const [dueDate, setDueDate] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceUnit, setRecurrenceUnit] = useState<RecurrenceUnit>('weeks')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.task(Number(id)).then((t) => {
      setTitle(t.title)
      setNotes(t.notes || '')
      setLocation(t.location)
      setEffort(t.effort)
      setPriority(t.priority)
      setDueDate(toDateInputValue(t.dueDate))
      if (t.recurrenceInterval) {
        setRecurring(true)
        setRecurrenceInterval(t.recurrenceInterval)
        setRecurrenceUnit(t.recurrenceUnit || 'weeks')
      }
      setSubtasks(t.subtasks.map((s) => s.text))
    }).finally(() => setLoading(false))
  }, [id])

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks((prev) => [...prev, newSubtask.trim()])
    setNewSubtask('')
  }

  const removeSubtask = (i: number) => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const data = {
        title,
        notes: notes || undefined,
        location,
        effort,
        priority,
        dueDate: dueDate || undefined,
        recurrenceInterval: recurring ? recurrenceInterval : undefined,
        recurrenceUnit: recurring ? recurrenceUnit : undefined,
        subtasks,
      }
      if (isEdit) {
        await api.updateTask(Number(id), data)
        navigate(`/tasks/${id}`)
      } else {
        await api.createTask(data)
        navigate('/')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-zinc-500 py-8 text-center">Načítání...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h1 className="text-xl font-bold text-white">{isEdit ? 'Upravit úkol' : 'Nový úkol'}</h1>

      <div>
        <label className="form-label">Název *</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Název úkolu"
          required
          autoFocus={!isEdit}
        />
      </div>

      <div>
        <label className="form-label">Poznámka</label>
        <textarea
          className="form-input resize-none"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Volitelná poznámka..."
        />
      </div>

      <div>
        <label className="form-label">Lokace</label>
        <Pills options={LOCATION_OPTIONS} value={location} onChange={setLocation} />
      </div>

      <div>
        <label className="form-label">Náročnost</label>
        <Pills options={EFFORT_OPTIONS} value={effort} onChange={setEffort} />
      </div>

      <div>
        <label className="form-label">Priorita</label>
        <Pills options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
      </div>

      <div>
        <label className="form-label">Termín</label>
        <input
          type="date"
          className="form-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* Recurrence */}
      <div className="card p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          <span className="text-sm text-zinc-200">Opakovat po dokončení</span>
        </label>
        {recurring && (
          <div className="flex items-center gap-2 pl-7">
            <span className="text-sm text-zinc-400">každých</span>
            <input
              type="number"
              min={1}
              max={365}
              className="form-input w-20"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
            />
            <select
              className="form-select w-32"
              value={recurrenceUnit}
              onChange={(e) => setRecurrenceUnit(e.target.value as RecurrenceUnit)}
            >
              {(Object.entries(RECURRENCE_UNIT_LABELS) as [RecurrenceUnit, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Subtasks */}
      <div className="space-y-2">
        <label className="form-label">Podúkoly</label>
        {subtasks.map((text, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-zinc-300 bg-zinc-800 rounded-lg px-3 py-2">{text}</span>
            <button type="button" onClick={() => removeSubtask(i)} className="text-zinc-500 hover:text-red-400 transition-colors">
              ✕
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="Přidat podúkol..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
          />
          {newSubtask.trim() && (
            <button type="button" onClick={addSubtask} className="btn-secondary">
              +
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1 py-3">
          {saving ? 'Ukládám...' : isEdit ? 'Uložit' : 'Vytvořit úkol'}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
          Zrušit
        </button>
      </div>
    </form>
  )
}
