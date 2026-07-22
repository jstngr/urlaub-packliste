import { useCallback, useState } from 'react'

const KEY = 'urlaub.name'

export function useIdentity(): { name: string | null; setName: (n: string) => void } {
  const [name, setNameState] = useState<string | null>(() => localStorage.getItem(KEY))
  const setName = useCallback((n: string) => {
    const trimmed = n.trim()
    localStorage.setItem(KEY, trimmed)
    setNameState(trimmed)
  }, [])
  return { name, setName }
}
