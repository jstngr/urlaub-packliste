import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import './NameDialog.css'

export function NameDialog(props: {
  people: string[]
  onConfirm: (name: string) => void
  currentName?: string
  onCancel?: () => void
}): JSX.Element {
  const [value, setValue] = useState(props.currentName ?? '')
  const dismiss = props.onCancel
  const switching = props.currentName !== undefined

  useEffect(() => {
    if (!dismiss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dismiss])

  return (
    <div className="name-backdrop" onClick={dismiss ? () => dismiss() : undefined}>
      <div className="name-card" onClick={(e) => e.stopPropagation()}>
        <h1>{switching ? 'Wer bist du?' : 'Wer bist du?'}</h1>
        <p>
          {switching
            ? 'Wähle eine Person aus oder ändere deinen Namen.'
            : 'Damit wir wissen, wer was mitbringt.'}
        </p>
        {props.people.length > 0 && (
          <div className="name-chips">
            {props.people.map((p) => (
              <button
                key={p}
                className={p === props.currentName ? 'current' : undefined}
                onClick={() => props.onConfirm(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <label htmlFor="name-input">{switching ? 'Oder neuer Name' : 'Dein Name'}</label>
        <input
          id="name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="z.B. Mama"
        />
        <div className="name-actions">
          {dismiss && (
            <button type="button" className="ghost" onClick={() => dismiss()}>
              Abbrechen
            </button>
          )}
          <button
            className="primary"
            disabled={value.trim().length === 0}
            onClick={() => props.onConfirm(value.trim())}
          >
            {switching ? 'Übernehmen' : 'Los geht’s'}
          </button>
        </div>
      </div>
    </div>
  )
}
