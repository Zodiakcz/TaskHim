import type { Task, Subtask, Completion, ShoppingItem, Stats, UserName } from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Chyba ${res.status}`)
  }
  return res.json()
}

type Ok = { ok: boolean }

export const api = {
  // Auth
  me: () => request<{ userName: UserName }>('/auth/me'),
  login: (userName: UserName, password: string) =>
    request<{ userName: UserName }>('/auth/login', { method: 'POST', body: JSON.stringify({ userName, password }) }),
  logout: () => request<Ok>('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<Ok>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Tasks
  tasks: () => request<Task[]>('/tasks'),
  task: (id: number) => request<Task>(`/tasks/${id}`),
  createTask: (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: string[] }) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: number, data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: string[] }) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: number) => request<Ok>(`/tasks/${id}`, { method: 'DELETE' }),
  completeTask: (id: number, note?: string) =>
    request<Ok>(`/tasks/${id}/complete`, { method: 'POST', body: JSON.stringify({ note }) }),
  toggleSubtask: (taskId: number, subtaskId: number, checked: boolean) =>
    request<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ checked }),
    }),

  // Completions
  completions: (params?: { user?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString()
    return request<Completion[]>(`/completions${q ? `?${q}` : ''}`)
  },
  stats: () => request<Stats>('/completions/stats'),

  // Shopping
  shopping: () => request<ShoppingItem[]>('/shopping'),
  addShoppingItem: (name: string, note?: string) =>
    request<ShoppingItem>('/shopping', { method: 'POST', body: JSON.stringify({ name, note }) }),
  toggleShoppingItem: (id: number) =>
    request<ShoppingItem>(`/shopping/${id}/check`, { method: 'PATCH' }),
  deleteShoppingItem: (id: number) => request<Ok>(`/shopping/${id}`, { method: 'DELETE' }),
}
