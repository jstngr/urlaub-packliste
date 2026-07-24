import {
  collection, addDoc, doc, setDoc, onSnapshot, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Category } from '../domain/types'
import { DEFAULT_CATEGORIES } from '../domain/categories'

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

export async function seedDefaultCategoriesIfEmpty(existing: Category[]): Promise<void> {
  if (existing.length > 0) return
  // Deterministic doc IDs make seeding idempotent: if two clients seed the
  // empty list at once (or a partial seed is retried), they write to the same
  // 7 documents and converge instead of creating duplicates.
  await Promise.all(
    DEFAULT_CATEGORIES.map((name, i) =>
      setDoc(doc(col, `default-${i}`), { name, reihenfolge: i }),
    ),
  )
}
