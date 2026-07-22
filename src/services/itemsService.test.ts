import { describe, it, expect } from 'vitest'
import { docToItem } from './firestoreConverters'

describe('docToItem', () => {
  it('maps a firestore doc to an Item with defaults', () => {
    const item = docToItem('abc', {
      was: 'Nudeln',
      wer: ['Papa'],
      erledigt: false,
      kategorie: 'Getränke',
      erstelltAm: { toMillis: () => 1234 },
    })
    expect(item).toEqual({
      id: 'abc',
      was: 'Nudeln',
      menge: undefined,
      wer: ['Papa'],
      notiz: undefined,
      erledigt: false,
      kategorie: 'Getränke',
      erstelltAm: 1234,
    })
  })

  it('defaults wer to [] and erstelltAm to 0 when missing', () => {
    const item = docToItem('x', { was: 'X', erledigt: true, kategorie: 'Sonstiges' })
    expect(item.wer).toEqual([])
    expect(item.erstelltAm).toBe(0)
  })
})
