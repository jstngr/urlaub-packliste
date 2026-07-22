import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIdentity } from './useIdentity'

beforeEach(() => localStorage.clear())

describe('useIdentity', () => {
  it('starts null when nothing stored', () => {
    const { result } = renderHook(() => useIdentity())
    expect(result.current.name).toBeNull()
  })

  it('persists and reads the name', () => {
    const { result } = renderHook(() => useIdentity())
    act(() => result.current.setName('Papa'))
    expect(result.current.name).toBe('Papa')
    expect(localStorage.getItem('urlaub.name')).toBe('Papa')
  })
})
