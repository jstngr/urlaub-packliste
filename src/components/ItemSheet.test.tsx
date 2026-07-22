import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemSheet } from './ItemSheet'

const cats = [{ id: '1', name: 'Getränke', reihenfolge: 0 }, { id: '2', name: 'Sonstiges', reihenfolge: 1 }]

describe('ItemSheet', () => {
  it('saves a new item with current user pre-selected as wer', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={['Papa']} defaultKategorie="Getränke"
        currentUser="Papa" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.type(screen.getByLabelText('Was'), 'Nudeln')
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      was: 'Nudeln', kategorie: 'Getränke', wer: ['Papa'],
    }))
  })

  it('blocks save when Was is empty and shows an error', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={[]} defaultKategorie="Getränke"
        currentUser="Mama" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Bitte gib an, was mitgebracht wird.')).toBeInTheDocument()
  })
})
