import { useState } from 'react'
import './NameDialog.css'

export function NameDialog(props: {
  people: string[]
  onConfirm: (name: string) => void
}): JSX.Element {
  const [value, setValue] = useState('')
  return (
    <div className="name-backdrop">
      <div className="name-card">
        <h1>Wer bist du?</h1>
        <p>Damit wir wissen, wer was mitbringt.</p>
        {props.people.length > 0 && (
          <div className="name-chips">
            {props.people.map((p) => (
              <button key={p} onClick={() => props.onConfirm(p)}>{p}</button>
            ))}
          </div>
        )}
        <label htmlFor="name-input">Dein Name</label>
        <input
          id="name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="z.B. Mama"
        />
        <button
          className="primary"
          disabled={value.trim().length === 0}
          onClick={() => props.onConfirm(value.trim())}
        >
          Los geht’s
        </button>
      </div>
    </div>
  )
}
