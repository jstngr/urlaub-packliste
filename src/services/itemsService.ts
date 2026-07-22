import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Item } from '../domain/types'
import { docToItem } from './firestoreConverters'

export type NewItem = Omit<Item, 'id' | 'erstelltAm'>

const col = collection(db, 'items')

/**
 * Removes keys whose value is `undefined` from an object.
 * Firestore's `addDoc`/`updateDoc` throw "Unsupported field value: undefined"
 * when a field is explicitly set to `undefined` (this app uses plain
 * `getFirestore`, so undefined-stripping is not enabled globally).
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

export function subscribeItems(cb: (items: Item[]) => void): () => void {
  const q = query(col, orderBy('erstelltAm', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => docToItem(d.id, d.data())))
  })
}

export function addItem(input: NewItem): Promise<unknown> {
  return addDoc(col, { ...stripUndefined(input), erstelltAm: serverTimestamp() })
}

export function updateItem(id: string, patch: Partial<Item>): Promise<void> {
  return updateDoc(doc(db, 'items', id), stripUndefined(patch))
}

export function deleteItem(id: string): Promise<void> {
  return deleteDoc(doc(db, 'items', id))
}

export function toggleErledigt(id: string, erledigt: boolean): Promise<void> {
  return updateDoc(doc(db, 'items', id), { erledigt })
}
