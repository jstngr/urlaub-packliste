import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import './App.css'
import { useIdentity } from './hooks/useIdentity'
import { useAppData } from './hooks/useAppData'
import { NameDialog } from './components/NameDialog'
import { TabBar, ALL_TAB } from './components/TabBar'
import { ItemCard } from './components/ItemCard'
import { ItemSheet } from './components/ItemSheet'
import { PromptDialog } from './components/PromptDialog'
import { groupItemsByCategory } from './domain/items'
import type { Item } from './domain/types'
import { addItem, updateItem, deleteItem, toggleErledigt } from './services/itemsService'
import { addCategory } from './services/categoriesService'
import { addPerson } from './services/peopleService'

export default function App(): JSX.Element {
  const { name, setName } = useIdentity()
  const { items, categories, people, loading } = useAppData()
  const [active, setActive] = useState<string>(ALL_TAB)
  const [sheet, setSheet] = useState<{ mode: 'add' | 'edit'; item?: Item } | null>(null)
  const [dialog, setDialog] = useState<{ kind: 'addCategory' } | { kind: 'rename' } | null>(null)

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories])

  if (!name) {
    return (
      <NameDialog
        people={people}
        onConfirm={(n) => { void addPerson(n); setName(n) }}
      />
    )
  }

  const visibleItems = active === ALL_TAB ? items : items.filter((i) => i.kategorie === active)
  const groups =
    active === ALL_TAB
      ? groupItemsByCategory(items, categoryNames)
      : [{ kategorie: active, items: visibleItems }]

  const handleSave = (data: {
    was: string; menge?: string; wer: string[]; notiz?: string; kategorie: string
  }) => {
    data.wer.forEach((w) => { if (!people.includes(w)) void addPerson(w) })
    if (sheet?.mode === 'edit' && sheet.item) {
      void updateItem(sheet.item.id, data)
    } else {
      void addItem({ ...data, erledigt: false })
    }
    setSheet(null)
  }

  const handleAddCategory = () => setDialog({ kind: 'addCategory' })

  const defaultKategorie = active === ALL_TAB ? (categoryNames[0] ?? 'Sonstiges') : active

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Urlaub – Wer bringt was</h1>
          <button className="whoami" onClick={() => setDialog({ kind: 'rename' })}>
            {name} ✎
          </button>
        </div>
      </header>

      <TabBar categories={categories} active={active} onSelect={setActive} onAddCategory={handleAddCategory} />

      <main className="list">
        {loading && <p className="hint">Lädt…</p>}
        {!loading && visibleItems.length === 0 && <p className="hint">Noch nichts eingetragen. Tippe unten auf „+ Eintrag“.</p>}
        {groups.map((g) => (
          <section key={g.kategorie}>
            {active === ALL_TAB && <h2 className="group-title">{g.kategorie}</h2>}
            {g.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={(erledigt) => void toggleErledigt(item.id, erledigt)}
                onEdit={() => setSheet({ mode: 'edit', item })}
                onDelete={() => void deleteItem(item.id)}
              />
            ))}
          </section>
        ))}
      </main>

      <button className="fab" onClick={() => setSheet({ mode: 'add' })}>+ Eintrag</button>

      {sheet && (
        <ItemSheet
          mode={sheet.mode}
          initial={sheet.item}
          categories={categories}
          people={people}
          defaultKategorie={defaultKategorie}
          currentUser={name}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}

      {dialog?.kind === 'addCategory' && (
        <PromptDialog
          title="Neue Kategorie"
          label="Name der Kategorie"
          placeholder="z.B. Strand & Baden"
          submitLabel="Anlegen"
          onSubmit={(v) => {
            void addCategory(v)
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'rename' && (
        <PromptDialog
          title="Dein Name"
          label="So heißt du in der Liste"
          initialValue={name}
          submitLabel="Speichern"
          onSubmit={(v) => {
            setName(v)
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
