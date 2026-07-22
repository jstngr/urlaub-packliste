import type { Category } from './types'

export const DEFAULT_CATEGORIES: string[] = [
  'Allgemeine Essenszutaten',
  'Getränke',
  'Spielzeug/Unterhaltung',
  'Küche/Haushalt',
  'Hygiene/Bad',
  'Erste Hilfe/Medizin',
  'Sonstiges',
]

export function sortCategories(cats: Category[]): Category[] {
  return [...cats].sort((a, b) => a.reihenfolge - b.reihenfolge)
}
