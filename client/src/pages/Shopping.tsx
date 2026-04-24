import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { ShoppingItem } from '@/lib/types'

export function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [newNote, setNewNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setItems(await api.shopping())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim() || adding) return
    setAdding(true)
    try {
      await api.addShoppingItem(newItem.trim(), newNote.trim() || undefined)
      setNewItem('')
      setNewNote('')
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Chyba')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (id: number) => {
    await api.toggleShoppingItem(id)
    await load()
  }

  const handleDelete = async (id: number) => {
    await api.deleteShoppingItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  if (loading) return <div className="text-zinc-500 py-8 text-center">Načítání...</div>

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Nákupní seznam</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="Přidat položku..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            disabled={adding}
          />
          {newItem.trim() && (
            <button type="submit" className="btn-primary" disabled={adding}>
              Přidat
            </button>
          )}
        </div>
        {newItem.trim() && (
          <input
            className="form-input"
            placeholder="Množství / poznámka (volitelné)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        )}
      </form>

      {/* Unchecked items */}
      {unchecked.length === 0 && checked.length === 0 && (
        <p className="text-zinc-600 text-sm py-2">Seznam je prázdný</p>
      )}

      <div className="space-y-2">
        {unchecked.map((item) => (
          <ShoppingRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </div>

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">
            Zakoupeno ({checked.length})
          </p>
          {checked.map((item) => (
            <ShoppingRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function ShoppingRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className={`card px-4 py-3 flex items-center gap-3 ${item.checked ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onToggle(item.id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          item.checked
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-zinc-600 hover:border-indigo-500'
        }`}
      >
        {item.checked && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.checked ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
          {item.name}
        </p>
        {item.note && <p className="text-xs text-zinc-500">{item.note}</p>}
      </div>

      <span className="text-xs text-zinc-600 shrink-0">{item.addedBy}</span>

      <button
        onClick={() => onDelete(item.id)}
        className="text-zinc-600 hover:text-red-400 transition-colors text-sm shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
