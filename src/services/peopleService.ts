import { collection, addDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const col = collection(db, 'people')

export function subscribePeople(cb: (names: string[]) => void): () => void {
  return onSnapshot(col, (snap) => {
    const names = snap.docs
      .map((d) => (d.data().name as string) ?? '')
      .filter(Boolean)
    cb([...new Set(names)].sort((a, b) => a.localeCompare(b, 'de')))
  })
}

export async function addPerson(name: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) return
  await addDoc(col, { name: trimmed })
}
