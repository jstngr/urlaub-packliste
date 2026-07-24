import { useEffect, useMemo, useRef, useState } from 'react'
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

  // Collapse duplicate category docs (same name) to one, keeping first order.
  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>()
    return categories.filter((c) => {
      if (seen.has(c.name)) return false
      seen.add(c.name)
      return true
    })
  }, [categories])

  return { items, categories: uniqueCategories, people, loading: !catLoaded }
}
