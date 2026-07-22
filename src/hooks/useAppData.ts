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
