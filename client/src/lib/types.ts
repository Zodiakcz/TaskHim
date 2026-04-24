export type Location = 'DOMA' | 'VENKU' | 'EXTERNI'
export type Effort = 'KRATKE' | 'STREDNI' | 'DLOUHE'
export type Priority = 'NIZKA' | 'NORMALNI' | 'VYSOKA'
export type Status = 'OTEVRENY' | 'HOTOVY'
export type RecurrenceUnit = 'days' | 'weeks' | 'months'
export type UserName = 'Dave' | 'Anna'

export interface Subtask {
  id: number
  taskId: number
  text: string
  order: number
  checked: boolean
}

export interface Completion {
  id: number
  taskId: number
  userName: string
  completedAt: string
  note: string | null
  task?: { title: string; effort: Effort; location: Location }
}

export interface Task {
  id: number
  title: string
  notes: string | null
  location: Location
  effort: Effort
  priority: Priority
  dueDate: string | null
  recurrenceInterval: number | null
  recurrenceUnit: RecurrenceUnit | null
  status: Status
  activeSince: string
  createdBy: string
  createdAt: string
  subtasks: Subtask[]
  completions?: Completion[]
}

export interface ShoppingItem {
  id: number
  name: string
  note: string | null
  addedBy: string
  checked: boolean
  checkedAt: string | null
  createdAt: string
}

export interface Stats {
  allTime: Record<string, { count: number; points: number }>
  thisMonth: Record<string, { count: number; points: number }>
  thisWeek: Record<string, { count: number; points: number }>
}

export const LOCATION_LABELS: Record<Location, string> = {
  DOMA: 'Doma',
  VENKU: 'Venku',
  EXTERNI: 'Externí',
}

export const EFFORT_LABELS: Record<Effort, string> = {
  KRATKE: 'Krátké',
  STREDNI: 'Střední',
  DLOUHE: 'Dlouhé',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  NIZKA: 'Nízká',
  NORMALNI: 'Normální',
  VYSOKA: 'Vysoká',
}

export const RECURRENCE_UNIT_LABELS: Record<RecurrenceUnit, string> = {
  days: 'dní',
  weeks: 'týdnů',
  months: 'měsíců',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  VYSOKA: 3,
  NORMALNI: 2,
  NIZKA: 1,
}
