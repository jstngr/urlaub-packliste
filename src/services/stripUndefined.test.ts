import { describe, it, expect } from 'vitest'
import { stripUndefined } from './itemsService'

describe('stripUndefined', () => {
  it('removes keys whose value is undefined', () => {
    const result = stripUndefined({ a: 1, b: undefined, c: 'x' })
    expect(result).toEqual({ a: 1, c: 'x' })
    expect('b' in result).toBe(false)
  })

  it('keeps empty-string values', () => {
    const result = stripUndefined({ notiz: '' })
    expect(result).toEqual({ notiz: '' })
  })

  it('keeps 0 values', () => {
    const result = stripUndefined({ count: 0 })
    expect(result).toEqual({ count: 0 })
  })

  it('keeps false values', () => {
    const result = stripUndefined({ erledigt: false })
    expect(result).toEqual({ erledigt: false })
  })

  it('keeps normal values untouched', () => {
    const result = stripUndefined({ was: 'Nudeln', wer: ['Papa'], kategorie: 'Getränke' })
    expect(result).toEqual({ was: 'Nudeln', wer: ['Papa'], kategorie: 'Getränke' })
  })

  it('regression: a real ItemSheet-style payload with blank menge/notiz has no undefined keys', () => {
    const payload = {
      was: 'Nudeln',
      menge: undefined,
      wer: ['Papa'],
      notiz: undefined,
      kategorie: 'Getränke',
    }
    const result = stripUndefined(payload)
    expect(result).toEqual({ was: 'Nudeln', wer: ['Papa'], kategorie: 'Getränke' })
    expect(Object.values(result).some((v) => v === undefined)).toBe(false)
  })
})
