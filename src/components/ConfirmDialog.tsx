import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import './dialog.css'

export function ConfirmDialog(props: {
  title: string
  message?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}): JSX.Element {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [props.onCancel])

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
        {props.message && <p className="dialog-message">{props.message}</p>}
        <div className="dialog-actions">
          <button type="button" className="ghost" onClick={props.onCancel}>
            {props.cancelLabel ?? 'Abbrechen'}
          </button>
          <button type="button" className="primary" ref={confirmRef} onClick={props.onConfirm}>
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
