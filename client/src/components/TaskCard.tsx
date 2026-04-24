import { useNavigate } from 'react-router-dom'
import type { Task } from '@/lib/types'
import { LOCATION_LABELS, EFFORT_LABELS, PRIORITY_LABELS } from '@/lib/types'

function taskAgeBadge(createdAt: string): { days: number; colorClass: string } {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const colorClass =
    days <= 15 ? 'text-green-400 bg-green-400/10' :
    days <= 30 ? 'text-yellow-400 bg-yellow-400/10' :
                 'text-red-400 bg-red-400/10'
  return { days, colorClass }
}

function dueDateLabel(dueDate: string): { label: string; urgent: boolean } {
  const due = new Date(dueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d po termínu`, urgent: true }
  if (diffDays === 0) return { label: 'Dnes', urgent: true }
  if (diffDays === 1) return { label: 'Zítra', urgent: false }
  if (diffDays <= 6) {
    const day = due.toLocaleDateString('cs-CZ', { weekday: 'short' })
    return { label: day, urgent: false }
  }
  return { label: `+${diffDays}d`, urgent: false }
}

interface Props {
  task: Task
}

export function TaskCard({ task }: Props) {
  const navigate = useNavigate()
  const isRecurring = task.recurrenceInterval !== null
  const isHighPriority = task.priority === 'VYSOKA'

  return (
    <button
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="w-full text-left card px-4 py-3 flex items-start gap-3 hover:bg-zinc-800/60 transition-colors active:scale-[0.99]"
    >
      {/* Priority indicator */}
      <div className="mt-1 shrink-0">
        {isHighPriority ? (
          <span className="text-red-400 text-base leading-none">●</span>
        ) : (
          <span className="text-zinc-600 text-base leading-none">○</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{task.title}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
          <span className="text-xs text-zinc-500">{LOCATION_LABELS[task.location]}</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{EFFORT_LABELS[task.effort]}</span>
          {task.priority !== 'NORMALNI' && (
            <>
              <span className="text-xs text-zinc-600">·</span>
              <span className={`text-xs ${isHighPriority ? 'text-red-400' : 'text-zinc-500'}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        {task.dueDate && (() => {
          const { label, urgent } = dueDateLabel(task.dueDate!)
          return (
            <span className={`text-xs font-medium ${urgent ? 'text-red-400' : 'text-zinc-400'}`}>
              {label}
            </span>
          )
        })()}
        {isRecurring && <span className="text-zinc-500 text-xs">↻</span>}
        {!isRecurring && (() => {
          const { days, colorClass } = taskAgeBadge(task.createdAt)
          return (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
              {days}d
            </span>
          )
        })()}
      </div>
    </button>
  )
}
