import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../services/itemsService', () => ({
  subscribeItems: (cb: (i: unknown[]) => void) => { cb([{ id: '1', was: 'Nudeln', wer: [], erledigt: false, kategorie: 'Getränke', erstelltAm: 0 }]); return () => {} },
}))
vi.mock('../services/categoriesService', () => ({
  // Two docs with the same name simulate a racy-seed duplicate.
  subscribeCategories: (cb: (c: unknown[]) => void) => {
    cb([
      { id: 'c1', name: 'Getränke', reihenfolge: 0 },
      { id: 'c2', name: 'Getränke', reihenfolge: 0 },
    ])
    return () => {}
  },
}))
vi.mock('../services/peopleService', () => ({
  subscribePeople: (cb: (n: string[]) => void) => { cb(['Papa']); return () => {} },
}))

import { useAppData } from './useAppData'

beforeEach(() => vi.clearAllMocks())

describe('useAppData', () => {
  it('exposes subscribed items, categories, people and stops loading', async () => {
    const { result } = renderHook(() => useAppData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((i) => i.was)).toEqual(['Nudeln'])
    expect(result.current.people).toEqual(['Papa'])
  })

  it('de-duplicates categories by name (racy-seed duplicates collapse to one)', async () => {
    const { result } = renderHook(() => useAppData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories.map((c) => c.name)).toEqual(['Getränke'])
  })
})
