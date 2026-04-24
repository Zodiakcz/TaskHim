import { useUser } from '@/lib/user'
import type { UserName } from '@/lib/types'

const USERS: UserName[] = ['Dave', 'Anna']

export function UserPicker() {
  const { setUser } = useUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
      <h1 className="text-3xl font-bold text-white mb-2">TaskHim</h1>
      <p className="text-zinc-400 mb-10">Kdo jsi?</p>
      <div className="flex gap-4">
        {USERS.map((name) => (
          <button
            key={name}
            onClick={() => setUser(name)}
            className="btn-primary text-lg px-8 py-4 rounded-2xl"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
