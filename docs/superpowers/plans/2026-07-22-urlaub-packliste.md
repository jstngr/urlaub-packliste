# Urlaub-Packliste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shared, mobile-first web app where a family organizes who brings what to a rented vacation house — no login, realtime, hosted on GitHub Pages with a Firebase Firestore backend.

**Architecture:** React + Vite + TypeScript single-page app. Firestore holds three collections (`items`, `categories`, `people`) and the UI subscribes to them realtime via `onSnapshot`. Identity is a locally-remembered display name (no auth). Pure logic (grouping, seeding, validation) is unit-tested with Vitest; Firestore access sits behind a thin service layer tested against mocks. Deployed as a static build to GitHub Pages.

**Tech Stack:** React 18, Vite 5, TypeScript, Firebase Web SDK v10 (Firestore), Vitest + @testing-library/react, gh-pages deploy via GitHub Actions.

## Global Constraints

- Language of all UI copy: **German**.
- 7 default categories, exact names: **Allgemeine Essenszutaten, Getränke, Spielzeug/Unterhaltung, Küche/Haushalt, Hygiene/Bad, Erste Hilfe/Medizin, Sonstiges**.
- Mobile-first: layouts target ~360px width first; large tap targets (min 44px height).
- No authentication in v1. Firestore rules open (read+write for all).
- Everyone may edit and delete any item (no ownership logic).
- Item fields: `was` (required), `menge?`, `wer: string[]`, `notiz?`, `erledigt: boolean`, `kategorie`, `erstelltAm`.
- Realtime: all clients reflect changes via `onSnapshot`.
- Node 18+ and npm.

---

### Task 1: Scaffold Vite + React + TS project with Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Create: `src/setupTests.ts`
- Test: `src/smoke.test.ts`

**Interfaces:**
- Produces: a runnable dev app (`npm run dev`) and a working test runner (`npm test`).

- [ ] **Step 1: Scaffold with Vite**

Run in the project root (`/Users/tobiasjustinger/code/urlaub-liste`):
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install firebase
```
If `npm create` refuses because the directory is non-empty, scaffold into a temp dir and move files in, preserving `docs/` and `.git/`.

- [ ] **Step 2: Configure Vitest**

Edit `vite.config.ts`:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is set to the GitHub Pages repo path in Task 13.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

Create `src/setupTests.ts`:
```ts
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write a smoke test**

Create `src/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TS app with Vitest"
```

---

### Task 2: Provision Firebase project and wire the config module

**Files:**
- Create: `src/firebase.ts`
- Create: `.env.local` (gitignored), `.env.example`
- Modify: `.gitignore` (ensure `.env.local` present)

**Interfaces:**
- Produces: `export const db: Firestore` from `src/firebase.ts`, used by all services.

- [ ] **Step 1: Create/choose Firebase project (live action)**

Use the Firebase MCP tools:
- `firebase_list_projects` — check for an existing suitable project.
- If none, `firebase_create_project` with a name like `urlaub-packliste`.
- `firebase_create_app` with platform `web` to get a web app; then `firebase_get_sdk_config` to retrieve `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
- Ensure Firestore is initialized: `firebase_init` for Firestore in this project directory (creates `firebase.json`, `firestore.rules`, `firestore.indexes.json`), then confirm/enable Firestore in Native mode.

Record the SDK config values for the next step. (Firestore rules are written in Task 3.)

- [ ] **Step 2: Store config in env**

Create `.env.example`:
```
VITE_FB_API_KEY=
VITE_FB_AUTH_DOMAIN=
VITE_FB_PROJECT_ID=
VITE_FB_STORAGE_BUCKET=
VITE_FB_MESSAGING_SENDER_ID=
VITE_FB_APP_ID=
```
Create `.env.local` with the real values from Step 1. Confirm `.gitignore` contains `.env.local` (Vite template includes `*.local`).

- [ ] **Step 3: Write the Firebase module**

Create `src/firebase.ts`:
```ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

- [ ] **Step 4: Type the env vars**

Append to `src/vite-env.d.ts`:
```ts
interface ImportMetaEnv {
  readonly VITE_FB_API_KEY: string
  readonly VITE_FB_AUTH_DOMAIN: string
  readonly VITE_FB_PROJECT_ID: string
  readonly VITE_FB_STORAGE_BUCKET: string
  readonly VITE_FB_MESSAGING_SENDER_ID: string
  readonly VITE_FB_APP_ID: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 5: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Firebase config module and env template"
```

---

### Task 3: Firestore security rules (open) + deploy

**Files:**
- Modify/Create: `firestore.rules`
- Modify: `firebase.json` (Firestore rules reference — created by `firebase_init`)

**Interfaces:**
- Produces: deployed open rules so the client can read/write `items`, `categories`, `people`.

- [ ] **Step 1: Write open rules**

Set `firestore.rules` to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Note: intentionally open per spec. Restrict later if a light protection is added.

- [ ] **Step 2: Deploy rules**

Use the Firebase MCP `firebase_deploy` tool to deploy Firestore rules (or note that deploy happens with the config present). Confirm via `firebase_get_security_rules` that the rules are live.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add open Firestore security rules"
```

---

### Task 4: Domain types + pure helpers (grouping, ordering, validation)

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/categories.ts`
- Create: `src/domain/items.ts`
- Test: `src/domain/categories.test.ts`, `src/domain/items.test.ts`

**Interfaces:**
- Produces:
  - `type Category = { id: string; name: string; reihenfolge: number }`
  - `type Item = { id: string; was: string; menge?: string; wer: string[]; notiz?: string; erledigt: boolean; kategorie: string; erstelltAm: number }`
  - `const DEFAULT_CATEGORIES: string[]` (the 7 names, in order)
  - `function sortCategories(cats: Category[]): Category[]`
  - `function groupItemsByCategory(items: Item[], categoryOrder: string[]): { kategorie: string; items: Item[] }[]`
  - `function validateItemInput(input: { was: string }): string | null` (returns error message or null)

- [ ] **Step 1: Write failing tests for categories**

Create `src/domain/categories.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_CATEGORIES, sortCategories } from './categories'

describe('DEFAULT_CATEGORIES', () => {
  it('has the 7 spec categories in order', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      'Allgemeine Essenszutaten',
      'Getränke',
      'Spielzeug/Unterhaltung',
      'Küche/Haushalt',
      'Hygiene/Bad',
      'Erste Hilfe/Medizin',
      'Sonstiges',
    ])
  })
})

describe('sortCategories', () => {
  it('sorts by reihenfolge ascending', () => {
    const out = sortCategories([
      { id: 'b', name: 'B', reihenfolge: 2 },
      { id: 'a', name: 'A', reihenfolge: 1 },
    ])
    expect(out.map((c) => c.id)).toEqual(['a', 'b'])
  })
})
```

- [ ] **Step 2: Run tests, verify fail**

Run: `npm test -- src/domain/categories.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement categories + types**

Create `src/domain/types.ts`:
```ts
export type Category = { id: string; name: string; reihenfolge: number }

export type Item = {
  id: string
  was: string
  menge?: string
  wer: string[]
  notiz?: string
  erledigt: boolean
  kategorie: string
  erstelltAm: number
}
```

Create `src/domain/categories.ts`:
```ts
import type { Category } from './types'

export const DEFAULT_CATEGORIES: string[] = [
  'Allgemeine Essenszutaten',
  'Getränke',
  'Spielzeug/Unterhaltung',
  'Küche/Haushalt',
  'Hygiene/Bad',
  'Erste Hilfe/Medizin',
  'Sonstiges',
]

export function sortCategories(cats: Category[]): Category[] {
  return [...cats].sort((a, b) => a.reihenfolge - b.reihenfolge)
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- src/domain/categories.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing tests for items helpers**

Create `src/domain/items.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { groupItemsByCategory, validateItemInput } from './items'
import type { Item } from './types'

const mk = (id: string, kategorie: string): Item => ({
  id, was: id, wer: [], erledigt: false, kategorie, erstelltAm: 0,
})

describe('groupItemsByCategory', () => {
  it('groups items under categories in the given order', () => {
    const items = [mk('1', 'Getränke'), mk('2', 'Sonstiges'), mk('3', 'Getränke')]
    const out = groupItemsByCategory(items, ['Getränke', 'Sonstiges'])
    expect(out).toEqual([
      { kategorie: 'Getränke', items: [items[0], items[2]] },
      { kategorie: 'Sonstiges', items: [items[1]] },
    ])
  })

  it('omits categories with no items', () => {
    const out = groupItemsByCategory([mk('1', 'Getränke')], ['Getränke', 'Sonstiges'])
    expect(out.map((g) => g.kategorie)).toEqual(['Getränke'])
  })

  it('puts items of unknown categories last, after known ones', () => {
    const items = [mk('1', 'Neu'), mk('2', 'Getränke')]
    const out = groupItemsByCategory(items, ['Getränke'])
    expect(out.map((g) => g.kategorie)).toEqual(['Getränke', 'Neu'])
  })
})

describe('validateItemInput', () => {
  it('rejects empty was', () => {
    expect(validateItemInput({ was: '   ' })).toBe('Bitte gib an, was mitgebracht wird.')
  })
  it('accepts non-empty was', () => {
    expect(validateItemInput({ was: 'Nudeln' })).toBeNull()
  })
})
```

- [ ] **Step 6: Run tests, verify fail**

Run: `npm test -- src/domain/items.test.ts`
Expected: FAIL.

- [ ] **Step 7: Implement items helpers**

Create `src/domain/items.ts`:
```ts
import type { Item } from './types'

export function validateItemInput(input: { was: string }): string | null {
  if (input.was.trim().length === 0) return 'Bitte gib an, was mitgebracht wird.'
  return null
}

export function groupItemsByCategory(
  items: Item[],
  categoryOrder: string[],
): { kategorie: string; items: Item[] }[] {
  const known = new Set(categoryOrder)
  const unknown = [
    ...new Set(items.map((i) => i.kategorie).filter((k) => !known.has(k))),
  ]
  const order = [...categoryOrder, ...unknown]
  return order
    .map((kategorie) => ({
      kategorie,
      items: items.filter((i) => i.kategorie === kategorie),
    }))
    .filter((g) => g.items.length > 0)
}
```

- [ ] **Step 8: Run tests, verify pass**

Run: `npm test -- src/domain/items.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add domain types and pure helpers with tests"
```

---

### Task 5: Firestore service layer (CRUD + realtime) with mocked tests

**Files:**
- Create: `src/services/firestoreConverters.ts`
- Create: `src/services/itemsService.ts`
- Create: `src/services/categoriesService.ts`
- Create: `src/services/peopleService.ts`
- Test: `src/services/itemsService.test.ts`

**Interfaces:**
- Consumes: `db` from `src/firebase.ts`; `Item`, `Category` from domain.
- Produces:
  - itemsService: `subscribeItems(cb: (items: Item[]) => void): () => void`, `addItem(input: NewItem): Promise<void>`, `updateItem(id: string, patch: Partial<Item>): Promise<void>`, `deleteItem(id: string): Promise<void>`, `toggleErledigt(id: string, erledigt: boolean): Promise<void>` where `type NewItem = Omit<Item, 'id' | 'erstelltAm'>`.
  - categoriesService: `subscribeCategories(cb: (c: Category[]) => void): () => void`, `addCategory(name: string): Promise<void>`, `seedDefaultCategoriesIfEmpty(existing: Category[]): Promise<void>`.
  - peopleService: `subscribePeople(cb: (names: string[]) => void): () => void`, `addPerson(name: string): Promise<void>`.

- [ ] **Step 1: Write failing test for item mapping**

The realtime/Firestore calls are thin wrappers; unit-test the pure mapping from a Firestore doc snapshot shape to an `Item`. Create `src/services/itemsService.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { docToItem } from './firestoreConverters'

describe('docToItem', () => {
  it('maps a firestore doc to an Item with defaults', () => {
    const item = docToItem('abc', {
      was: 'Nudeln',
      wer: ['Papa'],
      erledigt: false,
      kategorie: 'Getränke',
      erstelltAm: { toMillis: () => 1234 },
    })
    expect(item).toEqual({
      id: 'abc',
      was: 'Nudeln',
      menge: undefined,
      wer: ['Papa'],
      notiz: undefined,
      erledigt: false,
      kategorie: 'Getränke',
      erstelltAm: 1234,
    })
  })

  it('defaults wer to [] and erstelltAm to 0 when missing', () => {
    const item = docToItem('x', { was: 'X', erledigt: true, kategorie: 'Sonstiges' })
    expect(item.wer).toEqual([])
    expect(item.erstelltAm).toBe(0)
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/services/itemsService.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement converters**

Create `src/services/firestoreConverters.ts`:
```ts
import type { Item } from '../domain/types'

type Timestampish = { toMillis: () => number } | undefined

export function docToItem(id: string, data: Record<string, unknown>): Item {
  const ts = data.erstelltAm as Timestampish
  return {
    id,
    was: (data.was as string) ?? '',
    menge: (data.menge as string | undefined) ?? undefined,
    wer: (data.wer as string[] | undefined) ?? [],
    notiz: (data.notiz as string | undefined) ?? undefined,
    erledigt: Boolean(data.erledigt),
    kategorie: (data.kategorie as string) ?? '',
    erstelltAm: ts ? ts.toMillis() : 0,
  }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/services/itemsService.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement itemsService**

Create `src/services/itemsService.ts`:
```ts
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Item } from '../domain/types'
import { docToItem } from './firestoreConverters'

export type NewItem = Omit<Item, 'id' | 'erstelltAm'>

const col = collection(db, 'items')

export function subscribeItems(cb: (items: Item[]) => void): () => void {
  const q = query(col, orderBy('erstelltAm', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => docToItem(d.id, d.data())))
  })
}

export function addItem(input: NewItem): Promise<unknown> {
  return addDoc(col, { ...input, erstelltAm: serverTimestamp() })
}

export function updateItem(id: string, patch: Partial<Item>): Promise<void> {
  return updateDoc(doc(db, 'items', id), patch)
}

export function deleteItem(id: string): Promise<void> {
  return deleteDoc(doc(db, 'items', id))
}

export function toggleErledigt(id: string, erledigt: boolean): Promise<void> {
  return updateDoc(doc(db, 'items', id), { erledigt })
}
```

- [ ] **Step 6: Implement categoriesService**

Create `src/services/categoriesService.ts`:
```ts
import {
  collection, addDoc, onSnapshot, query, orderBy,
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
  await Promise.all(
    DEFAULT_CATEGORIES.map((name, i) => addDoc(col, { name, reihenfolge: i })),
  )
}
```

- [ ] **Step 7: Implement peopleService**

Create `src/services/peopleService.ts`:
```ts
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
```

- [ ] **Step 8: Run full test suite + typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all PASS, no type errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Firestore service layer for items, categories, people"
```

---

### Task 6: Identity hook (remembered display name)

**Files:**
- Create: `src/hooks/useIdentity.ts`
- Test: `src/hooks/useIdentity.test.ts`

**Interfaces:**
- Produces: `function useIdentity(): { name: string | null; setName: (n: string) => void }` backed by `localStorage` key `urlaub.name`.

- [ ] **Step 1: Write failing test**

Create `src/hooks/useIdentity.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/hooks/useIdentity.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useIdentity.ts`:
```ts
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
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/hooks/useIdentity.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useIdentity hook with localStorage persistence"
```

---

### Task 7: Data hooks wiring realtime subscriptions

**Files:**
- Create: `src/hooks/useAppData.ts`
- Test: `src/hooks/useAppData.test.tsx`

**Interfaces:**
- Consumes: services from Task 5.
- Produces: `function useAppData(): { items: Item[]; categories: Category[]; people: string[]; loading: boolean }`. On first non-loading render where categories are empty, calls `seedDefaultCategoriesIfEmpty`.

- [ ] **Step 1: Write failing test (services mocked)**

Create `src/hooks/useAppData.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../services/itemsService', () => ({
  subscribeItems: (cb: (i: unknown[]) => void) => { cb([{ id: '1', was: 'Nudeln', wer: [], erledigt: false, kategorie: 'Getränke', erstelltAm: 0 }]); return () => {} },
}))
vi.mock('../services/categoriesService', () => ({
  subscribeCategories: (cb: (c: unknown[]) => void) => { cb([{ id: 'c1', name: 'Getränke', reihenfolge: 0 }]); return () => {} },
  seedDefaultCategoriesIfEmpty: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../services/peopleService', () => ({
  subscribePeople: (cb: (n: string[]) => void) => { cb(['Papa']); return () => {} },
}))

import { useAppData } from './useAppData'

beforeEach(() => vi.clearAllMocks())

describe('useAppData', () => {
  it('exposes subscribed items, categories, people and stops loading', async () => {
    const { result } = renderHook(() => useAppData())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((i) => i.was)).toEqual(['Nudeln'])
    expect(result.current.categories.map((c) => c.name)).toEqual(['Getränke'])
    expect(result.current.people).toEqual(['Papa'])
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/hooks/useAppData.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useAppData.ts`:
```ts
import { useEffect, useRef, useState } from 'react'
import type { Item, Category } from '../domain/types'
import { subscribeItems } from '../services/itemsService'
import { subscribeCategories, seedDefaultCategoriesIfEmpty } from '../services/categoriesService'
import { subscribePeople } from '../services/peopleService'

export function useAppData(): {
  items: Item[]; categories: Category[]; people: string[]; loading: boolean
} {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [people, setPeople] = useState<string[]>([])
  const [catLoaded, setCatLoaded] = useState(false)
  const seeded = useRef(false)

  useEffect(() => subscribeItems(setItems), [])
  useEffect(() => subscribePeople(setPeople), [])
  useEffect(() => subscribeCategories((c) => { setCategories(c); setCatLoaded(true) }), [])

  useEffect(() => {
    if (catLoaded && !seeded.current && categories.length === 0) {
      seeded.current = true
      void seedDefaultCategoriesIfEmpty(categories)
    }
  }, [catLoaded, categories])

  return { items, categories, people, loading: !catLoaded }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/hooks/useAppData.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useAppData realtime hook with default seeding"
```

---

### Task 8: Onboarding name dialog

**Files:**
- Create: `src/components/NameDialog.tsx`
- Create: `src/components/NameDialog.css`
- Test: `src/components/NameDialog.test.tsx`

**Interfaces:**
- Consumes: `people: string[]`.
- Produces: `function NameDialog(props: { people: string[]; onConfirm: (name: string) => void }): JSX.Element`. Lets the user pick an existing name or type a new one; calls `onConfirm` with the chosen name.

- [ ] **Step 1: Write failing test**

Create `src/components/NameDialog.test.tsx`:
```tsx
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
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/components/NameDialog.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement component**

Create `src/components/NameDialog.tsx`:
```tsx
import { useState } from 'react'
import './NameDialog.css'

export function NameDialog(props: {
  people: string[]
  onConfirm: (name: string) => void
}): JSX.Element {
  const [value, setValue] = useState('')
  return (
    <div className="name-backdrop">
      <div className="name-card">
        <h1>Wer bist du?</h1>
        <p>Damit wir wissen, wer was mitbringt.</p>
        {props.people.length > 0 && (
          <div className="name-chips">
            {props.people.map((p) => (
              <button key={p} onClick={() => props.onConfirm(p)}>{p}</button>
            ))}
          </div>
        )}
        <label htmlFor="name-input">Dein Name</label>
        <input
          id="name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="z.B. Mama"
        />
        <button
          className="primary"
          disabled={value.trim().length === 0}
          onClick={() => props.onConfirm(value.trim())}
        >
          Los geht’s
        </button>
      </div>
    </div>
  )
}
```

Create `src/components/NameDialog.css`:
```css
.name-backdrop { position: fixed; inset: 0; display: grid; place-items: center;
  background: rgba(0,0,0,.4); padding: 16px; z-index: 20; }
.name-card { background: #fff; border-radius: 20px; padding: 24px; width: 100%;
  max-width: 340px; }
.name-card h1 { margin: 0 0 4px; font-size: 1.4rem; }
.name-card p { margin: 0 0 16px; color: #666; }
.name-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.name-chips button { border: 1px solid #d0d0d0; background: #f6f6f6;
  border-radius: 999px; padding: 8px 14px; font-size: 1rem; }
.name-card label { display: block; font-size: .85rem; color: #555; margin-bottom: 4px; }
.name-card input { width: 100%; padding: 12px; border: 1px solid #d0d0d0;
  border-radius: 12px; font-size: 1rem; margin-bottom: 16px; }
.name-card button.primary { width: 100%; min-height: 48px; border: none;
  border-radius: 12px; background: #2f7d5b; color: #fff; font-size: 1rem; }
.name-card button.primary:disabled { opacity: .5; }
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/components/NameDialog.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add onboarding NameDialog"
```

---

### Task 9: Category tab bar

**Files:**
- Create: `src/components/TabBar.tsx`
- Create: `src/components/TabBar.css`
- Test: `src/components/TabBar.test.tsx`

**Interfaces:**
- Consumes: `categories: Category[]`.
- Produces: `function TabBar(props: { categories: Category[]; active: string; onSelect: (tab: string) => void; onAddCategory: () => void }): JSX.Element`. Renders an `Alle` tab, one tab per category, and a `+` button. Active tab uses `aria-current="true"`. The special value for "all" is the exported constant `ALL_TAB = '__alle__'`.

- [ ] **Step 1: Write failing test**

Create `src/components/TabBar.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar, ALL_TAB } from './TabBar'

const cats = [{ id: '1', name: 'Getränke', reihenfolge: 0 }]

describe('TabBar', () => {
  it('renders Alle + category tabs and marks the active one', () => {
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={() => {}} onAddCategory={() => {}} />)
    expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Getränke' })).toBeInTheDocument()
  })

  it('calls onSelect with category name', async () => {
    const onSelect = vi.fn()
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={onSelect} onAddCategory={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Getränke' }))
    expect(onSelect).toHaveBeenCalledWith('Getränke')
  })

  it('calls onAddCategory when + tapped', async () => {
    const onAdd = vi.fn()
    render(<TabBar categories={cats} active={ALL_TAB} onSelect={() => {}} onAddCategory={onAdd} />)
    await userEvent.click(screen.getByRole('button', { name: 'Kategorie hinzufügen' }))
    expect(onAdd).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/components/TabBar.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement component**

Create `src/components/TabBar.tsx`:
```tsx
import type { Category } from '../domain/types'
import './TabBar.css'

export const ALL_TAB = '__alle__'

export function TabBar(props: {
  categories: Category[]
  active: string
  onSelect: (tab: string) => void
  onAddCategory: () => void
}): JSX.Element {
  const tab = (key: string, label: string) => (
    <button
      key={key}
      className="tab"
      aria-current={props.active === key ? 'true' : undefined}
      onClick={() => props.onSelect(key)}
    >
      {label}
    </button>
  )
  return (
    <nav className="tabbar" aria-label="Kategorien">
      {tab(ALL_TAB, 'Alle')}
      {props.categories.map((c) => tab(c.name, c.name))}
      <button className="tab tab-add" aria-label="Kategorie hinzufügen" onClick={props.onAddCategory}>
        +
      </button>
    </nav>
  )
}
```

Create `src/components/TabBar.css`:
```css
.tabbar { display: flex; gap: 8px; overflow-x: auto; padding: 10px 12px;
  position: sticky; top: 0; background: #fff; border-bottom: 1px solid #eee;
  -webkit-overflow-scrolling: touch; }
.tabbar::-webkit-scrollbar { display: none; }
.tab { flex: 0 0 auto; min-height: 40px; padding: 8px 16px; border-radius: 999px;
  border: 1px solid #d8d8d8; background: #f4f4f4; font-size: .95rem; white-space: nowrap; }
.tab[aria-current="true"] { background: #2f7d5b; color: #fff; border-color: #2f7d5b; }
.tab-add { font-size: 1.3rem; line-height: 1; padding: 8px 14px; }
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/components/TabBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add category TabBar"
```

---

### Task 10: Item card

**Files:**
- Create: `src/components/ItemCard.tsx`
- Create: `src/components/ItemCard.css`
- Test: `src/components/ItemCard.test.tsx`

**Interfaces:**
- Consumes: `Item` from domain.
- Produces: `function ItemCard(props: { item: Item; onToggle: (erledigt: boolean) => void; onEdit: () => void; onDelete: () => void }): JSX.Element`. Shows checkbox, `was`, `menge`, `wer` chips, `notiz`; edit and delete buttons. Delete asks `window.confirm` first.

- [ ] **Step 1: Write failing test**

Create `src/components/ItemCard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemCard } from './ItemCard'
import type { Item } from '../domain/types'

const item: Item = {
  id: '1', was: 'Nudeln', menge: '2 Pkg', wer: ['Papa', 'Mama'],
  notiz: 'Vollkorn', erledigt: false, kategorie: 'Getränke', erstelltAm: 0,
}

describe('ItemCard', () => {
  it('renders item details', () => {
    render(<ItemCard item={item} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('Nudeln')).toBeInTheDocument()
    expect(screen.getByText('2 Pkg')).toBeInTheDocument()
    expect(screen.getByText('Papa')).toBeInTheDocument()
    expect(screen.getByText('Mama')).toBeInTheDocument()
    expect(screen.getByText('Vollkorn')).toBeInTheDocument()
  })

  it('toggles erledigt', async () => {
    const onToggle = vi.fn()
    render(<ItemCard item={item} onToggle={onToggle} onEdit={() => {}} onDelete={() => {}} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('deletes after confirm', async () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ItemCard item={item} onToggle={() => {}} onEdit={() => {}} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: 'Löschen' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/components/ItemCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement component**

Create `src/components/ItemCard.tsx`:
```tsx
import type { Item } from '../domain/types'
import './ItemCard.css'

export function ItemCard(props: {
  item: Item
  onToggle: (erledigt: boolean) => void
  onEdit: () => void
  onDelete: () => void
}): JSX.Element {
  const { item } = props
  return (
    <div className={`item-card${item.erledigt ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={item.erledigt}
        onChange={(e) => props.onToggle(e.target.checked)}
        aria-label={`${item.was} erledigt`}
      />
      <div className="item-main">
        <div className="item-title">
          <span className="was">{item.was}</span>
          {item.menge && <span className="menge">{item.menge}</span>}
        </div>
        {item.wer.length > 0 && (
          <div className="wer">
            {item.wer.map((w) => <span key={w} className="wer-chip">{w}</span>)}
          </div>
        )}
        {item.notiz && <div className="notiz">{item.notiz}</div>}
      </div>
      <div className="item-actions">
        <button aria-label="Bearbeiten" onClick={props.onEdit}>✎</button>
        <button aria-label="Löschen" onClick={() => { if (window.confirm('Eintrag löschen?')) props.onDelete() }}>🗑</button>
      </div>
    </div>
  )
}
```

Create `src/components/ItemCard.css`:
```css
.item-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px;
  background: #fff; border: 1px solid #eee; border-radius: 14px; margin-bottom: 10px; }
.item-card.done { opacity: .55; }
.item-card.done .was { text-decoration: line-through; }
.item-card input[type="checkbox"] { width: 24px; height: 24px; margin-top: 2px; flex: 0 0 auto; }
.item-main { flex: 1 1 auto; min-width: 0; }
.item-title { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.was { font-weight: 600; font-size: 1.05rem; }
.menge { color: #777; font-size: .9rem; }
.wer { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.wer-chip { background: #eaf5ef; color: #2f7d5b; border-radius: 999px;
  padding: 2px 10px; font-size: .8rem; }
.notiz { color: #666; font-size: .85rem; margin-top: 6px; }
.item-actions { display: flex; gap: 4px; flex: 0 0 auto; }
.item-actions button { border: none; background: none; font-size: 1.1rem;
  min-width: 40px; min-height: 40px; }
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/components/ItemCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ItemCard component"
```

---

### Task 11: Add/Edit item sheet

**Files:**
- Create: `src/components/ItemSheet.tsx`
- Create: `src/components/ItemSheet.css`
- Test: `src/components/ItemSheet.test.tsx`

**Interfaces:**
- Consumes: `people: string[]`, `categories: Category[]`, `validateItemInput` from domain.
- Produces: `function ItemSheet(props: { mode: 'add' | 'edit'; initial?: Partial<Item>; categories: Category[]; people: string[]; defaultKategorie: string; currentUser: string; onSave: (data: { was: string; menge?: string; wer: string[]; notiz?: string; kategorie: string }) => void; onClose: () => void }): JSX.Element`. Multi-select for `wer` (toggle chips from `people` + current user pre-selected), free-text add of a new person, category select, validation on save.

- [ ] **Step 1: Write failing test**

Create `src/components/ItemSheet.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemSheet } from './ItemSheet'

const cats = [{ id: '1', name: 'Getränke', reihenfolge: 0 }, { id: '2', name: 'Sonstiges', reihenfolge: 1 }]

describe('ItemSheet', () => {
  it('saves a new item with current user pre-selected as wer', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={['Papa']} defaultKategorie="Getränke"
        currentUser="Papa" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.type(screen.getByLabelText('Was'), 'Nudeln')
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      was: 'Nudeln', kategorie: 'Getränke', wer: ['Papa'],
    }))
  })

  it('blocks save when Was is empty and shows an error', async () => {
    const onSave = vi.fn()
    render(
      <ItemSheet mode="add" categories={cats} people={[]} defaultKategorie="Getränke"
        currentUser="Mama" onSave={onSave} onClose={() => {}} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Bitte gib an, was mitgebracht wird.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/components/ItemSheet.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement component**

Create `src/components/ItemSheet.tsx`:
```tsx
import { useState } from 'react'
import type { Category, Item } from '../domain/types'
import { validateItemInput } from '../domain/items'
import './ItemSheet.css'

export function ItemSheet(props: {
  mode: 'add' | 'edit'
  initial?: Partial<Item>
  categories: Category[]
  people: string[]
  defaultKategorie: string
  currentUser: string
  onSave: (data: {
    was: string; menge?: string; wer: string[]; notiz?: string; kategorie: string
  }) => void
  onClose: () => void
}): JSX.Element {
  const [was, setWas] = useState(props.initial?.was ?? '')
  const [menge, setMenge] = useState(props.initial?.menge ?? '')
  const [notiz, setNotiz] = useState(props.initial?.notiz ?? '')
  const [kategorie, setKategorie] = useState(props.initial?.kategorie ?? props.defaultKategorie)
  const [wer, setWer] = useState<string[]>(props.initial?.wer ?? [props.currentUser])
  const [newPerson, setNewPerson] = useState('')
  const [error, setError] = useState<string | null>(null)

  const roster = [...new Set([props.currentUser, ...props.people, ...wer])].filter(Boolean)

  const toggleWer = (name: string) =>
    setWer((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]))

  const addNewPerson = () => {
    const t = newPerson.trim()
    if (t && !wer.includes(t)) setWer((cur) => [...cur, t])
    setNewPerson('')
  }

  const save = () => {
    const err = validateItemInput({ was })
    if (err) { setError(err); return }
    props.onSave({
      was: was.trim(),
      menge: menge.trim() || undefined,
      wer,
      notiz: notiz.trim() || undefined,
      kategorie,
    })
  }

  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{props.mode === 'add' ? 'Neuer Eintrag' : 'Eintrag bearbeiten'}</h2>

        <label htmlFor="was">Was</label>
        <input id="was" value={was} onChange={(e) => setWas(e.target.value)} placeholder="z.B. Nudeln" />

        <label htmlFor="menge">Menge / Anzahl</label>
        <input id="menge" value={menge} onChange={(e) => setMenge(e.target.value)} placeholder="z.B. 2 Packungen" />

        <label htmlFor="kategorie">Kategorie</label>
        <select id="kategorie" value={kategorie} onChange={(e) => setKategorie(e.target.value)}>
          {props.categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <span className="field-label">Wer bringt’s</span>
        <div className="wer-select">
          {roster.map((name) => (
            <button
              key={name}
              type="button"
              className={wer.includes(name) ? 'sel' : ''}
              onClick={() => toggleWer(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="new-person">
          <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} placeholder="Name hinzufügen" />
          <button type="button" onClick={addNewPerson}>+</button>
        </div>

        <label htmlFor="notiz">Notiz</label>
        <textarea id="notiz" value={notiz} onChange={(e) => setNotiz(e.target.value)} rows={2} />

        {error && <p className="error">{error}</p>}

        <div className="sheet-actions">
          <button type="button" className="ghost" onClick={props.onClose}>Abbrechen</button>
          <button type="button" className="primary" onClick={save}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
```

Create `src/components/ItemSheet.css`:
```css
.sheet-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: flex; align-items: flex-end; z-index: 20; }
.sheet { background: #fff; width: 100%; max-height: 90vh; overflow-y: auto;
  border-radius: 20px 20px 0 0; padding: 20px; }
.sheet h2 { margin: 0 0 12px; font-size: 1.2rem; }
.sheet label, .sheet .field-label { display: block; font-size: .82rem; color: #555;
  margin: 12px 0 4px; }
.sheet input, .sheet select, .sheet textarea { width: 100%; padding: 12px;
  border: 1px solid #d0d0d0; border-radius: 12px; font-size: 1rem; box-sizing: border-box; }
.wer-select { display: flex; flex-wrap: wrap; gap: 8px; }
.wer-select button { border: 1px solid #d0d0d0; background: #f6f6f6;
  border-radius: 999px; padding: 8px 14px; font-size: .95rem; }
.wer-select button.sel { background: #2f7d5b; color: #fff; border-color: #2f7d5b; }
.new-person { display: flex; gap: 8px; margin-top: 8px; }
.new-person input { flex: 1; }
.new-person button { flex: 0 0 auto; width: 48px; border: 1px solid #d0d0d0;
  border-radius: 12px; background: #f6f6f6; font-size: 1.2rem; }
.error { color: #c0392b; font-size: .9rem; margin: 10px 0 0; }
.sheet-actions { display: flex; gap: 10px; margin-top: 20px; }
.sheet-actions button { flex: 1; min-height: 48px; border-radius: 12px; font-size: 1rem; border: none; }
.sheet-actions .ghost { background: #eee; }
.sheet-actions .primary { background: #2f7d5b; color: #fff; }
```

- [ ] **Step 4: Run test, verify pass**

Run: `npm test -- src/components/ItemSheet.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add add/edit ItemSheet with multi-person selection"
```

---

### Task 12: App assembly + global mobile-first styling

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.css`
- Modify: `src/main.tsx` (import global styles), `index.html` (viewport, title, lang)
- Create: `src/index.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `useIdentity`, `useAppData`, all components and services.
- Produces: the assembled `App`. Wires realtime data, name onboarding, tab filtering (`ALL_TAB` groups by category via `groupItemsByCategory`), add/edit/delete/toggle via services, add-category prompt, and `addPerson` when a new name is confirmed or used.

- [ ] **Step 1: Write failing test (services + hooks mocked)**

Create `src/App.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./hooks/useAppData', () => ({
  useAppData: () => ({
    items: [{ id: '1', was: 'Nudeln', wer: ['Papa'], erledigt: false, kategorie: 'Getränke', erstelltAm: 0 }],
    categories: [{ id: 'c1', name: 'Getränke', reihenfolge: 0 }, { id: 'c2', name: 'Sonstiges', reihenfolge: 1 }],
    people: ['Papa'],
    loading: false,
  }),
}))
vi.mock('./services/itemsService', () => ({
  addItem: vi.fn().mockResolvedValue(undefined),
  updateItem: vi.fn().mockResolvedValue(undefined),
  deleteItem: vi.fn().mockResolvedValue(undefined),
  toggleErledigt: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('./services/categoriesService', () => ({ addCategory: vi.fn().mockResolvedValue(undefined) }))
vi.mock('./services/peopleService', () => ({ addPerson: vi.fn().mockResolvedValue(undefined) }))

import App from './App'

beforeEach(() => localStorage.clear())

describe('App', () => {
  it('shows the name dialog first, then the list', async () => {
    render(<App />)
    expect(screen.getByText('Wer bist du?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Papa' }))
    expect(screen.getByText('Nudeln')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alle' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, verify fail**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement App**

Replace `src/App.tsx`:
```tsx
import { useMemo, useState } from 'react'
import './App.css'
import { useIdentity } from './hooks/useIdentity'
import { useAppData } from './hooks/useAppData'
import { NameDialog } from './components/NameDialog'
import { TabBar, ALL_TAB } from './components/TabBar'
import { ItemCard } from './components/ItemCard'
import { ItemSheet } from './components/ItemSheet'
import { groupItemsByCategory } from './domain/items'
import type { Item } from './domain/types'
import { addItem, updateItem, deleteItem, toggleErledigt } from './services/itemsService'
import { addCategory } from './services/categoriesService'
import { addPerson } from './services/peopleService'

export default function App(): JSX.Element {
  const { name, setName } = useIdentity()
  const { items, categories, people, loading } = useAppData()
  const [active, setActive] = useState<string>(ALL_TAB)
  const [sheet, setSheet] = useState<{ mode: 'add' | 'edit'; item?: Item } | null>(null)

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories])

  if (!name) {
    return (
      <NameDialog
        people={people}
        onConfirm={(n) => { void addPerson(n); setName(n) }}
      />
    )
  }

  const visibleItems = active === ALL_TAB ? items : items.filter((i) => i.kategorie === active)
  const groups =
    active === ALL_TAB
      ? groupItemsByCategory(items, categoryNames)
      : [{ kategorie: active, items: visibleItems }]

  const handleSave = (data: {
    was: string; menge?: string; wer: string[]; notiz?: string; kategorie: string
  }) => {
    data.wer.forEach((w) => { if (!people.includes(w)) void addPerson(w) })
    if (sheet?.mode === 'edit' && sheet.item) {
      void updateItem(sheet.item.id, data)
    } else {
      void addItem({ ...data, erledigt: false })
    }
    setSheet(null)
  }

  const handleAddCategory = () => {
    const n = window.prompt('Name der neuen Kategorie?')
    if (n && n.trim()) void addCategory(n.trim())
  }

  const defaultKategorie = active === ALL_TAB ? (categoryNames[0] ?? 'Sonstiges') : active

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Urlaub – Wer bringt was</h1>
          <button className="whoami" onClick={() => setName(window.prompt('Dein Name?', name) || name)}>
            {name} ✎
          </button>
        </div>
      </header>

      <TabBar categories={categories} active={active} onSelect={setActive} onAddCategory={handleAddCategory} />

      <main className="list">
        {loading && <p className="hint">Lädt…</p>}
        {!loading && groups.length === 0 && <p className="hint">Noch nichts eingetragen. Tippe unten auf „+ Eintrag".</p>}
        {groups.map((g) => (
          <section key={g.kategorie}>
            {active === ALL_TAB && <h2 className="group-title">{g.kategorie}</h2>}
            {g.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={(erledigt) => void toggleErledigt(item.id, erledigt)}
                onEdit={() => setSheet({ mode: 'edit', item })}
                onDelete={() => void deleteItem(item.id)}
              />
            ))}
          </section>
        ))}
      </main>

      <button className="fab" onClick={() => setSheet({ mode: 'add' })}>+ Eintrag</button>

      {sheet && (
        <ItemSheet
          mode={sheet.mode}
          initial={sheet.item}
          categories={categories}
          people={people}
          defaultKategorie={defaultKategorie}
          currentUser={name}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Add global styles**

Create `src/index.css`:
```css
* { box-sizing: border-box; }
html, body, #root { margin: 0; height: 100%; }
body { font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif;
  background: #f2f4f3; color: #1c1c1c; }
button { cursor: pointer; font-family: inherit; }
```

Create `src/App.css`:
```css
.app { max-width: 560px; margin: 0 auto; min-height: 100%; background: #f2f4f3;
  padding-bottom: 88px; }
.app-header { padding: 16px; }
.app-header h1 { margin: 0; font-size: 1.25rem; }
.whoami { border: none; background: none; color: #2f7d5b; font-size: .9rem; padding: 4px 0; }
.list { padding: 12px; }
.group-title { font-size: .95rem; color: #444; margin: 16px 4px 8px; }
.hint { color: #777; text-align: center; margin-top: 32px; }
.fab { position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px;
  min-height: 52px; padding: 0 28px; border: none; border-radius: 999px;
  background: #2f7d5b; color: #fff; font-size: 1.05rem; font-weight: 600;
  box-shadow: 0 6px 18px rgba(0,0,0,.2); z-index: 10; }
```

Ensure `src/main.tsx` imports `./index.css`. Update `index.html`: `<html lang="de">`, `<title>Urlaub – Wer bringt was</title>`, and confirm `<meta name="viewport" content="width=device-width, initial-scale=1" />`.

- [ ] **Step 5: Run test, verify pass; run full suite + typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: assemble App with realtime list, tabs, add/edit flow"
```

---

### Task 13: Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts` (set `base`)
- Create: `README.md` (share link + how-to)

**Interfaces:**
- Produces: a public GitHub Pages URL serving the built app. Firebase config is injected at build time from GitHub repo secrets.

- [ ] **Step 1: Create GitHub repo and push**

```bash
gh repo create urlaub-packliste --public --source=. --remote=origin --push
```
Note the repo name; the Pages URL will be `https://<user>.github.io/urlaub-packliste/`.

- [ ] **Step 2: Set Vite base path**

Edit `vite.config.ts`, add `base: '/urlaub-packliste/'` to the config object (match the repo name exactly).

- [ ] **Step 3: Add Firebase config as repo secrets**

Using `gh`:
```bash
gh secret set VITE_FB_API_KEY --body "<value>"
gh secret set VITE_FB_AUTH_DOMAIN --body "<value>"
gh secret set VITE_FB_PROJECT_ID --body "<value>"
gh secret set VITE_FB_STORAGE_BUCKET --body "<value>"
gh secret set VITE_FB_MESSAGING_SENDER_ID --body "<value>"
gh secret set VITE_FB_APP_ID --body "<value>"
```

- [ ] **Step 4: Add deploy workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_FB_API_KEY: ${{ secrets.VITE_FB_API_KEY }}
          VITE_FB_AUTH_DOMAIN: ${{ secrets.VITE_FB_AUTH_DOMAIN }}
          VITE_FB_PROJECT_ID: ${{ secrets.VITE_FB_PROJECT_ID }}
          VITE_FB_STORAGE_BUCKET: ${{ secrets.VITE_FB_STORAGE_BUCKET }}
          VITE_FB_MESSAGING_SENDER_ID: ${{ secrets.VITE_FB_MESSAGING_SENDER_ID }}
          VITE_FB_APP_ID: ${{ secrets.VITE_FB_APP_ID }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Enable Pages + trigger deploy**

```bash
gh api -X POST repos/:owner/urlaub-packliste/pages -f build_type=workflow || true
git add -A
git commit -m "ci: deploy to GitHub Pages with Firebase env"
git push
```
Then in the repo settings, confirm Pages source = GitHub Actions. Watch the run:
```bash
gh run watch
```
Expected: workflow succeeds, Pages URL live.

- [ ] **Step 6: Write README with the share link**

Create `README.md` documenting: the live URL to share with the family, that opening the link and picking a name is all that's needed, and the "everyone can edit" nature.

- [ ] **Step 7: Verify live**

Open `https://<user>.github.io/urlaub-packliste/` on a phone-sized viewport. Confirm: name dialog appears, adding an item works, and a second browser reflects the change realtime.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: add README with family share link"
git push
```

---

## Notes for the implementer

- Firestore emulator is not required; service-layer tests mock the pure mapping. Live behavior is verified in Task 13 Step 7.
- Keep the green (`#2f7d5b`) accent consistent — it appears across components; if changed, update all CSS files.
- If `npm create vite` reports the directory is non-empty due to `docs/` and `.git/`, scaffold in a temp folder and copy `src/`, `index.html`, config files over.
