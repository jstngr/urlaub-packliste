import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import './dialog.css'

export function PromptDialog(props: {
  title: string
  label: string
  initialValue?: string
  placeholder?: string
  submitLabel: string
  onSubmit: (value: string) => void
  onCancel: () => void
}): JSX.Element {
  const [value, setValue] = useState(props.initialValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [props.onCancel])

  const submit = () => {
    const v = value.trim()
    if (v) props.onSubmit(v)
  }

  return (
    <div className="dialog-backdrop" onClick={props.onCancel}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog-title">{props.title}</h2>
        <label className="dialog-label" htmlFor="prompt-input">
          {props.label}
        </label>
        <input
          id="prompt-input"
          ref={inputRef}
          className="dialog-input"
          value={value}
          placeholder={props.placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
        <div className="dialog-actions">
          <button type="button" className="ghost" onClick={props.onCancel}>
            Abbrechen
          </button>
          <button
            type="button"
            className="primary"
            disabled={value.trim().length === 0}
            onClick={submit}
          >
            {props.submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
