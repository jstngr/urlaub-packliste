import { useState } from 'react'
import type { Category, Item } from '../domain/types'
import { validateItemInput } from '../domain/items'
import './ItemSheet.css'

export function ItemSheet(props: {
  mode: 'add' | 'edit'
  initial?: Partial<Item>
  categories: Category[]
  people: string[]
  defaultKategorie: string
  currentUser: string
  onSave: (data: {
    was: string; menge?: string; wer: string[]; notiz?: string; kategorie: string
  }) => void
  onClose: () => void
}): JSX.Element {
  const [was, setWas] = useState(props.initial?.was ?? '')
  const [menge, setMenge] = useState(props.initial?.menge ?? '')
  const [notiz, setNotiz] = useState(props.initial?.notiz ?? '')
  const [kategorie, setKategorie] = useState(props.initial?.kategorie ?? props.defaultKategorie)
  const [wer, setWer] = useState<string[]>(props.initial?.wer ?? [props.currentUser])
  const [newPerson, setNewPerson] = useState('')
  const [error, setError] = useState<string | null>(null)

  const roster = [...new Set([props.currentUser, ...props.people, ...wer])].filter(Boolean)

  const toggleWer = (name: string) =>
    setWer((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]))

  const addNewPerson = () => {
    const t = newPerson.trim()
    if (t && !wer.includes(t)) setWer((cur) => [...cur, t])
    setNewPerson('')
  }

  const save = () => {
    const err = validateItemInput({ was })
    if (err) { setError(err); return }
    props.onSave({
      was: was.trim(),
      menge: menge.trim() || undefined,
      wer,
      notiz: notiz.trim() || undefined,
      kategorie,
    })
  }

  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{props.mode === 'add' ? 'Neuer Eintrag' : 'Eintrag bearbeiten'}</h2>

        <label htmlFor="was">Was</label>
        <input id="was" value={was} onChange={(e) => setWas(e.target.value)} placeholder="z.B. Nudeln" />

        <label htmlFor="menge">Menge / Anzahl</label>
        <input id="menge" value={menge} onChange={(e) => setMenge(e.target.value)} placeholder="z.B. 2 Packungen" />

        <label htmlFor="kategorie">Kategorie</label>
        <select id="kategorie" value={kategorie} onChange={(e) => setKategorie(e.target.value)}>
          {props.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <span className="field-label">Wer bringt’s</span>
        <div className="wer-select">
          {roster.map((name) => (
            <button
              key={name}
              type="button"
              className={wer.includes(name) ? 'sel' : ''}
              onClick={() => toggleWer(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="new-person">
          <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} placeholder="Name hinzufügen" />
          <button type="button" onClick={addNewPerson}>+</button>
        </div>

        <label htmlFor="notiz">Notiz</label>
        <textarea id="notiz" value={notiz} onChange={(e) => setNotiz(e.target.value)} rows={2} />

        {error && <p className="error">{error}</p>}

        <div className="sheet-actions">
          <button type="button" className="ghost" onClick={props.onClose}>Abbrechen</button>
          <button type="button" className="primary" onClick={save}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
