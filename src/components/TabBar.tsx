import type { Category } from '../domain/types'
import './TabBar.css'

export const ALL_TAB = '__alle__'

export function TabBar(props: {
  categories: Category[]
  active: string
  onSelect: (tab: string) => void
  onAddCategory: () => void
}): JSX.Element {
  const tab = (key: string, label: string) => (
    <button
      key={key}
      className="tab"
      aria-current={props.active === key ? 'true' : undefined}
      onClick={() => props.onSelect(key)}
    >
      {label}
    </button>
  )
  return (
    <nav className="tabbar" aria-label="Kategorien">
      {tab(ALL_TAB, 'Alle')}
      {props.categories.map((c) => tab(c.name, c.name))}
      <button className="tab tab-add" aria-label="Kategorie hinzufügen" onClick={props.onAddCategory}>
        +
      </button>
    </nav>
  )
}
