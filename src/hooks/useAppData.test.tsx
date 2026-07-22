import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../services/itemsService', () => ({
  subscribeItems: (cb: (i: unknown[]) => void) => { cb([{ id: '1', was: 'Nudeln', wer: [], erledigt: false, kategorie: 'Getränke', erstelltAm: 0 }]); return () => {} },
}))
vi.mock('../services/categoriesService', () => ({
  subscribeCategories: (cb: (c: unknown[]) => void) => { cb([{ id: 'c1', name: 'Getränke', reihenfolge: 0 }]); return () => {} },
  seedDefaultCategoriesIfEmpty: vi.fn().mockResolvedValue(undefined),
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
    expect(result.current.categories.map((c) => c.name)).toEqual(['Getränke'])
    expect(result.current.people).toEqual(['Papa'])
  })
})
