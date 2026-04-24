import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user'

export function ChangePassword() {
  const navigate = useNavigate()
  const { userName, logout } = useUser()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('Nová hesla se neshodují')
      return
    }
    if (newPassword.length < 4) {
      setError('Nové heslo musí mít alespoň 4 znaky')
      return
    }
    setSaving(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setMessage('Heslo bylo změněno')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="max-w-sm">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm -ml-3 mb-4">
        ← Zpět
      </button>
      <h1 className="text-xl font-bold text-white mb-1">Nastavení</h1>
      <p className="text-zinc-500 text-sm mb-6">Přihlášen jako <span className="text-zinc-300 font-medium">{userName}</span></p>

      {error && (
        <div className="bg-red-900/30 border border-red-800/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 p-3 rounded-lg mb-4 text-sm">
          {message}
        </div>
      )}

      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Změna hesla</h2>
      <form onSubmit={handleSubmit} className="card p-5 space-y-4 mb-6">
        <div>
          <label className="form-label">Současné heslo</label>
          <input
            type="password"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Nové heslo</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="form-label">Nové heslo znovu</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Ukládám...' : 'Změnit heslo'}
        </button>
      </form>

      <button onClick={handleLogout} className="btn-danger w-full">
        Odhlásit se
      </button>
    </div>
  )
}
