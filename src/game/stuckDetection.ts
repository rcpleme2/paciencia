import { activeCards } from './boardQueries'
import type { Column, Card, Foundation } from './types'

export function isBoardStuck(tableau: Column[], waste: Column, stock: Card[], foundations: Foundation[]): boolean {
  if (stock.length > 0) return false

  const active = activeCards([...tableau, waste])
  const hasPromotableCategory = active.some((c) => c.kind === 'category')
  if (hasPromotableCategory) return false

  const foundCategoryIds = new Set(foundations.map((f) => f.categoryId))
  const hasDepositableWord = active.some((c) => c.kind === 'word' && foundCategoryIds.has(c.trueCategoryId))
  return !hasDepositableWord
}
