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
})
