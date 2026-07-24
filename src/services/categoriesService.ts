import {
  collection, addDoc, onSnapshot, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Category } from '../domain/types'

const col = collection(db, 'categories')

export function subscribeCategories(cb: (c: Category[]) => void): () => void {
  const q = query(col, orderBy('reihenfolge', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({
      id: d.id,
      name: (d.data().name as string) ?? '',
      reihenfolge: (d.data().reihenfolge as number) ?? 0,
    })))
  })
}

export async function addCategory(name: string): Promise<void> {
  await addDoc(col, { name: name.trim(), reihenfolge: Date.now() })
}
