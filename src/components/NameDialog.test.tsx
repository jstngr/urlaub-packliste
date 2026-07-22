import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NameDialog } from './NameDialog'

describe('NameDialog', () => {
  it('confirms a newly typed name', async () => {
    const onConfirm = vi.fn()
    render(<NameDialog people={[]} onConfirm={onConfirm} />)
    await userEvent.type(screen.getByLabelText('Dein Name'), 'Mama')
    await userEvent.click(screen.getByRole('button', { name: 'Los geht’s' }))
    expect(onConfirm).toHaveBeenCalledWith('Mama')
  })

  it('confirms an existing name when clicked', async () => {
    const onConfirm = vi.fn()
    render(<NameDialog people={['Papa']} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Papa' }))
    expect(onConfirm).toHaveBeenCalledWith('Papa')
  })

  describe('switch mode (currentName + onCancel)', () => {
    it('marks the current person and switches to another when picked', async () => {
      const onConfirm = vi.fn()
      render(
        <NameDialog
          people={['Papa', 'Mama']}
          currentName="Papa"
          onConfirm={onConfirm}
          onCancel={() => {}}
        />,
      )
      expect(screen.getByRole('button', { name: 'Papa' })).toHaveClass('current')
      expect(screen.getByRole('button', { name: 'Mama' })).not.toHaveClass('current')
      await userEvent.click(screen.getByRole('button', { name: 'Mama' }))
      expect(onConfirm).toHaveBeenCalledWith('Mama')
    })

    it('renames via the input and Übernehmen', async () => {
      const onConfirm = vi.fn()
      render(
        <NameDialog people={['Papa']} currentName="Papa" onConfirm={onConfirm} onCancel={() => {}} />,
      )
      const input = screen.getByLabelText('Oder neuer Name')
      await userEvent.clear(input)
      await userEvent.type(input, 'Papi')
      await userEvent.click(screen.getByRole('button', { name: 'Übernehmen' }))
      expect(onConfirm).toHaveBeenCalledWith('Papi')
    })

    it('cancels via the button, the backdrop, and Escape', async () => {
      const onCancel = vi.fn()
      render(
        <NameDialog people={['Papa']} currentName="Papa" onConfirm={() => {}} onCancel={onCancel} />,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
      await userEvent.keyboard('{Escape}')
      expect(onCancel).toHaveBeenCalledTimes(2)
    })
  })
})
