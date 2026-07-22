import { useState } from 'react'
import type { JSX } from 'react'
import type { Item } from '../domain/types'
import { ConfirmDialog } from './ConfirmDialog'
import './ItemCard.css'

export function ItemCard(props: {
  item: Item
  onToggle: (erledigt: boolean) => void
  onEdit: () => void
  onDelete: () => void
}): JSX.Element {
  const { item } = props
  const [confirming, setConfirming] = useState(false)
  return (
    <div className={`item-card${item.erledigt ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={item.erledigt}
        onChange={(e) => props.onToggle(e.target.checked)}
        aria-label={`${item.was} erledigt`}
      />
      <div className="item-main">
        <div className="item-title">
          <span className="was">{item.was}</span>
          {item.menge && <span className="menge">{item.menge}</span>}
        </div>
        {item.wer.length > 0 && (
          <div className="wer">
            {item.wer.map((w) => <span key={w} className="wer-chip">{w}</span>)}
          </div>
        )}
        {item.notiz && <div className="notiz">{item.notiz}</div>}
      </div>
      <div className="item-actions">
        <button aria-label="Bearbeiten" onClick={props.onEdit}>✎</button>
        <button aria-label="Löschen" onClick={() => setConfirming(true)}>🗑</button>
      </div>
      {confirming && (
        <ConfirmDialog
          title="Eintrag löschen?"
          message={`„${item.was}“ wird für alle entfernt.`}
          confirmLabel="Ja, löschen"
          onConfirm={() => {
            setConfirming(false)
            props.onDelete()
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
