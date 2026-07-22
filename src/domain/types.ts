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
