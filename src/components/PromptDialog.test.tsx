import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptDialog } from './PromptDialog'

describe('PromptDialog', () => {
  it('submits the trimmed typed value', async () => {
    const onSubmit = vi.fn()
    render(
      <PromptDialog title="Neue Kategorie" label="Name" submitLabel="Anlegen" onSubmit={onSubmit} onCancel={() => {}} />,
    )
    await userEvent.type(screen.getByLabelText('Name'), '  Strand  ')
    await userEvent.click(screen.getByRole('button', { name: 'Anlegen' }))
    expect(onSubmit).toHaveBeenCalledWith('Strand')
  })

  it('prefills the initial value and submits on Enter', async () => {
    const onSubmit = vi.fn()
    render(
      <PromptDialog
        title="Dein Name"
        label="Name"
        initialValue="Papa"
        submitLabel="Speichern"
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )
    const input = screen.getByLabelText('Name') as HTMLInputElement
    expect(input.value).toBe('Papa')
    await userEvent.type(input, '{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('Papa')
  })

  it('disables submit when empty and never submits blank', async () => {
    const onSubmit = vi.fn()
    render(
      <PromptDialog title="Neue Kategorie" label="Name" submitLabel="Anlegen" onSubmit={onSubmit} onCancel={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Anlegen' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Anlegen' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('cancels via the cancel button and Escape', async () => {
    const onCancel = vi.fn()
    render(
      <PromptDialog title="Neue Kategorie" label="Name" submitLabel="Anlegen" onSubmit={() => {}} onCancel={onCancel} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(2)
  })
})
