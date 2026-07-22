import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemCard } from './ItemCard'
import type { Item } from '../domain/types'

const item: Item = {
  id: '1', was: 'Nudeln', menge: '2 Pkg', wer: ['Papa', 'Mama'],
  notiz: 'Vollkorn', erledigt: false, kategorie: 'Getränke', erstelltAm: 0,
}

describe('ItemCard', () => {
  it('renders item details', () => {
    render(<ItemCard item={item} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Nudeln')).toBeInTheDocument()
    expect(screen.getByText('2 Pkg')).toBeInTheDocument()
    expect(screen.getByText('Papa')).toBeInTheDocument()
    expect(screen.getByText('Mama')).toBeInTheDocument()
    expect(screen.getByText('Vollkorn')).toBeInTheDocument()
  })

  it('toggles erledigt', async () => {
    const onToggle = vi.fn()
    render(<ItemCard item={item} onToggle={onToggle} onEdit={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('deletes after confirm', async () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ItemCard item={item} onToggle={() => {}} onEdit={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: 'Löschen' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
