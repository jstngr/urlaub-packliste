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

  it('seeds wer chips from initial.wer in edit mode', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="edit" categories={cats} people={[]} defaultKategorie="Getränke"
        currentUser="Papa" initial={{ was: 'Nudeln', wer: ['Oma', 'Opa'], kategorie: 'Getränke' }}
        onSave={onSave} onClose={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Oma' })).toHaveClass('sel')
    expect(screen.getByRole('button', { name: 'Opa' })).toHaveClass('sel')
    expect(screen.getByRole('button', { name: 'Papa' })).not.toHaveClass('sel')

    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      wer: ['Oma', 'Opa'],
    }))
  })

  it('toggles a wer chip off and another on before saving', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={['Mama']} defaultKategorie="Getränke"
        currentUser="Papa" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.type(screen.getByLabelText('Was'), 'Nudeln')
    await userEvent.click(screen.getByRole('button', { name: 'Papa' }))
    expect(screen.getByRole('button', { name: 'Papa' })).not.toHaveClass('sel')
    await userEvent.click(screen.getByRole('button', { name: 'Mama' }))
    expect(screen.getByRole('button', { name: 'Mama' })).toHaveClass('sel')

    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      wer: ['Mama'],
    }))
  })

  it('adds a new person as a selected chip and includes them in the saved wer', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={[]} defaultKategorie="Getränke"
        currentUser="Papa" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.type(screen.getByLabelText('Was'), 'Nudeln')
    await userEvent.type(screen.getByPlaceholderText('Name hinzufügen'), 'Oma')
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByRole('button', { name: 'Oma' })).toHaveClass('sel')

    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      wer: ['Papa', 'Oma'],
    }))
  })

  it('closes on backdrop click but not on a click inside the sheet', async () => {
    const onClose = vi.fn()
    const { container } = render(
      <ItemSheet mode="add" categories={cats} people={[]} defaultKategorie="Getränke"
        currentUser="Papa" onSave={() => {}} onClose={onClose} />,
    )
    await userEvent.click(screen.getByRole('heading', { name: 'Neuer Eintrag' }))
    expect(onClose).not.toHaveBeenCalled()

    const backdrop = container.querySelector('.sheet-backdrop')
    expect(backdrop).not.toBeNull()
    await userEvent.click(backdrop as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
