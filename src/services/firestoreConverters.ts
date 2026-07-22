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
