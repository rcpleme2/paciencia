import { activeCards, emptyColumnCount } from './boardQueries'
import type { Column, Card } from './types'

export function isBoardStuck(tableau: Column[], stock: Card[]): boolean {
  if (stock.length > 0) return false
  if (emptyColumnCount(tableau) > 0 && stock.length > 0) return false

  const active = activeCards(tableau)
  const counts = new Map<string, number>()
  for (const card of active) {
    counts.set(card.trueCategoryId, (counts.get(card.trueCategoryId) ?? 0) + 1)
  }
  const hasCompletableGroup = Array.from(counts.values()).some((count) => count >= 4)
  return !hasCompletableGroup
}
