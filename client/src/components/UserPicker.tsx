import { useState } from 'react'
import { useUser } from '@/lib/user'
import type { UserName } from '@/lib/types'

const USERS: UserName[] = ['Dave', 'Anna']

export function UserPicker() {
  const { login } = useUser()
  const [selected, setSelected] = useState<UserName | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNameClick = (name: UserName) => {
    setSelected(name)
    setError('')
    setPassword('')
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      await login(selected, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
      <h1 className="text-3xl font-bold text-white mb-2">TaskHim</h1>
      <p className="text-zinc-400 mb-10">Kdo jsi?</p>

      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
        <div className="flex gap-4 justify-center">
          {USERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleNameClick(name)}
              className={`flex-1 text-lg py-4 rounded-2xl border transition-colors font-medium ${
                selected === name
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {selected && (
          <>
            <input
              type="password"
              className="form-input"
              placeholder="Heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Přihlašuji...' : 'Přihlásit se'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
