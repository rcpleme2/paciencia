import type { DifficultyParams } from './types'

export function difficulty(levelNumber: number): DifficultyParams {
  const level = Math.max(1, levelNumber)

  const totalCards = Math.min(28, 16 + Math.floor((level - 1) / 3) * 4)
  const columns = Math.min(7, 4 + Math.floor((level - 1) / 5))
  const redHerringCount = Math.min(4, Math.max(0, Math.floor((level - 4) / 5) + (level >= 4 ? 1 : 0)))
  const stockFraction = Math.min(0.35, Math.max(0, (level - 1) * 0.03))
  const maxMistakes = Math.max(3, 6 - Math.floor((level - 1) / 6))

  return { totalCards, columns, redHerringCount, stockFraction, maxMistakes }
}
