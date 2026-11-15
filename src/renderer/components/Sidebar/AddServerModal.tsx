import { useState, type FormEvent } from 'react'
import type { Server } from '../../store/serverStore'

export interface ServerFormValues {
  name: string
  host: string
  username: string
  pemKey: string
}

interface AddServerModalProps {
  initial?: Server
  onSave: (values: ServerFormValues) => Promise<void>
  onClose: () => void
}

export function AddServerModal({ initial, onSave, onClose }: AddServerModalProps): JSX.Element {
  const isEdit = Boolean(initial)

  const [name, setName] = useState(initial?.name ?? '')
  const [host, setHost] = useState(initial?.host ?? '')
  const [username, setUsername] = useState(initial?.username ?? '')
  const [pemKey, setPemKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!name || !host || !username || (!isEdit && !pemKey)) {
      setError('Name, IP, username, and PEM key are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, host, username, pemKey })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save server — check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="w-96 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
      >
        <h2 className="text-sm font-semibold text-neutral-100">
          {isEdit ? 'Edit Server' : 'Add Server'}
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            IP Address / Host
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            PEM Key{' '}
            {isEdit && <span className="text-neutral-600">(leave blank to keep existing)</span>}
            <textarea
              value={pemKey}
              onChange={(e) => setPemKey(e.target.value)}
              rows={5}
              className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 font-mono text-xs text-neutral-100"
            />
          </label>
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
