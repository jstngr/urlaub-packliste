import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./hooks/useAppData', () => ({
  useAppData: () => ({
    items: [
      { id: '1', was: 'Nudeln', wer: ['Papa'], erledigt: false, kategorie: 'Getränke', erstelltAm: 0 },
      { id: '2', was: 'Sonnencreme', wer: ['Mama'], erledigt: false, kategorie: 'Sonstiges', erstelltAm: 0 },
    ],
    categories: [{ id: 'c1', name: 'Getränke', reihenfolge: 0 }, { id: 'c2', name: 'Sonstiges', reihenfolge: 1 }],
    people: ['Papa', 'Mama'],
    loading: false,
  }),
}))
vi.mock('./services/itemsService', () => ({
  addItem: vi.fn().mockResolvedValue(undefined),
  updateItem: vi.fn().mockResolvedValue(undefined),
  deleteItem: vi.fn().mockResolvedValue(undefined),
  toggleErledigt: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('./services/categoriesService', () => ({ addCategory: vi.fn().mockResolvedValue(undefined) }))
vi.mock('./services/peopleService', () => ({ addPerson: vi.fn().mockResolvedValue(undefined) }))

import App from './App'

beforeEach(() => localStorage.clear())

describe('App', () => {
  it('shows the name dialog first, then the list', async () => {
    render(<App />)
    expect(screen.getByText('Wer bist du?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Papa' }))
    expect(screen.getByText('Nudeln')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
  })

  it('filters to only the current user\'s items with "Nur meine"', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Papa' }))
    // Von allen (default): both items show
    expect(screen.getByText('Nudeln')).toBeInTheDocument()
    expect(screen.getByText('Sonnencreme')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Nur meine' }))
    expect(screen.getByText('Nudeln')).toBeInTheDocument() // Papa brings it
    expect(screen.queryByText('Sonnencreme')).not.toBeInTheDocument() // Mama's — hidden

    await userEvent.click(screen.getByRole('button', { name: 'Von allen' }))
    expect(screen.getByText('Sonnencreme')).toBeInTheDocument()
  })
})
