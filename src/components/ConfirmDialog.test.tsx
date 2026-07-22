import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    render(
      <ConfirmDialog
        title="Eintrag löschen?"
        message="„Nudeln“ wird entfernt."
        confirmLabel="Ja, löschen"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('Eintrag löschen?')).toBeInTheDocument()
    expect(screen.getByText('„Nudeln“ wird entfernt.')).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog title="Weg damit?" confirmLabel="Ja, löschen" onConfirm={onConfirm} onCancel={() => {}} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ja, löschen' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel via the cancel button, the backdrop, and Escape', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog title="Weg damit?" confirmLabel="Ja, löschen" onConfirm={() => {}} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('does not close when the card itself is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog title="Weg damit?" confirmLabel="Ja, löschen" onConfirm={() => {}} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('dialog'))
    expect(onCancel).not.toHaveBeenCalled()
  })
})
