import { describe, it, expect } from 'vitest'
import { DEFAULT_CATEGORIES, sortCategories } from './categories'

describe('DEFAULT_CATEGORIES', () => {
  it('has the 7 spec categories in order', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      'Allgemeine Essenszutaten',
      'Getränke',
      'Spielzeug/Unterhaltung',
      'Küche/Haushalt',
      'Hygiene/Bad',
      'Erste Hilfe/Medizin',
      'Sonstiges',
    ])
  })
})

describe('sortCategories', () => {
  it('sorts by reihenfolge ascending', () => {
    const out = sortCategories([
      { id: 'b', name: 'B', reihenfolge: 2 },
      { id: 'a', name: 'A', reihenfolge: 1 },
    ])
    expect(out.map((c) => c.id)).toEqual(['a', 'b'])
  })
})
