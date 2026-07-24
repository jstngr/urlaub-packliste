import { describe, it, expect } from 'vitest'
import { groupItemsByCategory, validateItemInput } from './items'
import type { Item } from './types'

const mk = (id: string, kategorie: string): Item => ({
  id, was: id, wer: [], erledigt: false, kategorie, erstelltAm: 0,
})

describe('groupItemsByCategory', () => {
  it('groups items under categories in the given order', () => {
    const items = [mk('1', 'Getränke'), mk('2', 'Sonstiges'), mk('3', 'Getränke')]
    const out = groupItemsByCategory(items, ['Getränke', 'Sonstiges'])
    expect(out).toEqual([
      { kategorie: 'Getränke', items: [items[0], items[2]] },
      { kategorie: 'Sonstiges', items: [items[1]] },
    ])
  })

  it('omits categories with no items', () => {
    const out = groupItemsByCategory([mk('1', 'Getränke')], ['Getränke', 'Sonstiges'])
    expect(out.map((g) => g.kategorie)).toEqual(['Getränke'])
  })

  it('puts items of unknown categories last, after known ones', () => {
    const items = [mk('1', 'Neu'), mk('2', 'Getränke')]
    const out = groupItemsByCategory(items, ['Getränke'])
    expect(out.map((g) => g.kategorie)).toEqual(['Getränke', 'Neu'])
  })

  it('does not duplicate a category or its items when categoryOrder repeats a name', () => {
    // A duplicate category document (from a racy seed) surfaces as a repeated
    // name here; it must not double the group or its items.
    const items = [mk('1', 'Getränke'), mk('2', 'Getränke')]
    const out = groupItemsByCategory(items, ['Getränke', 'Getränke'])
    expect(out).toHaveLength(1)
    expect(out[0].kategorie).toBe('Getränke')
    expect(out[0].items).toHaveLength(2)
  })
})

describe('validateItemInput', () => {
  it('rejects empty was', () => {
    expect(validateItemInput({ was: '   ' })).toBe('Bitte gib an, was mitgebracht wird.')
  })
  it('accepts non-empty was', () => {
    expect(validateItemInput({ was: 'Nudeln' })).toBeNull()
  })
})
