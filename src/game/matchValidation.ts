import type { Card } from './types'

export function validateMatch(selectedCards: Card[]): boolean {
  if (selectedCards.length !== 4) return false
  const [first, ...rest] = selectedCards
  return rest.every((c) => c.trueCategoryId === first.trueCategoryId)
}
