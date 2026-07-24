import type { Item } from './types'

export function validateItemInput(input: { was: string }): string | null {
  if (input.was.trim().length === 0) return 'Bitte gib an, was mitgebracht wird.'
  return null
}

export function groupItemsByCategory(
  items: Item[],
  categoryOrder: string[],
): { kategorie: string; items: Item[] }[] {
  const known = new Set(categoryOrder)
  const unknown = [
    ...new Set(items.map((i) => i.kategorie).filter((k) => !known.has(k))),
  ]
  // De-duplicate names so a repeated category (e.g. from a racy seed that
  // created duplicate category docs) yields one group, not two.
  const seen = new Set<string>()
  const order = [...categoryOrder, ...unknown].filter((k) => {
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  return order
    .map((kategorie) => ({
      kategorie,
      items: items.filter((i) => i.kategorie === kategorie),
    }))
    .filter((g) => g.items.length > 0)
}
