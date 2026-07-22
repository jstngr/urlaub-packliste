import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar, ALL_TAB } from './TabBar'

const cats = [{ id: '1', name: 'Getränke', reihenfolge: 0 }]

describe('TabBar', () => {
  it('renders Alle + category tabs and marks the active one', () => {
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={() => {}} onAddCategory={() => {}} />)
    expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Getränke' })).toBeInTheDocument()
  })

  it('calls onSelect with category name', async () => {
    const onSelect = vi.fn()
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={onSelect} onAddCategory={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Getränke' }))
    expect(onSelect).toHaveBeenCalledWith('Getränke')
  })

  it('calls onAddCategory when + tapped', async () => {
    const onAdd = vi.fn()
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={() => {}} onAddCategory={onAdd} />)
    await userEvent.click(screen.getByRole('button', { name: 'Kategorie hinzufügen' }))
    expect(onAdd).toHaveBeenCalled()
  })
})
