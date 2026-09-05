import { describe, expect, it } from 'vitest'
import { wordBank } from '../data/categories'
import { activeCards } from './boardQueries'
import { generateLevel } from './levelGenerator'

describe('generateLevel', () => {
  it('produces a total card count divisible by 4 and consistent per-category groups', () => {
    for (let level = 1; level <= 30; level += 3) {
      const result = generateLevel({ levelNumber: level, seed: level * 7919, bank: wordBank })
      expect(result.totalCards % 4).toBe(0)

      const allCards = [...result.columns.flat(), ...result.stock]
      expect(allCards.length).toBe(result.totalCards)

      const counts = new Map<string, number>()
      for (const card of allCards) {
        counts.set(card.trueCategoryId, (counts.get(card.trueCategoryId) ?? 0) + 1)
      }
      for (const count of counts.values()) {
        expect(count % 4).toBe(0)
      }
    }
  })

  it('only injects red herrings whose alternate category is present on the board', () => {
    for (let level = 4; level <= 30; level += 2) {
      const result = generateLevel({ levelNumber: level, seed: level * 104729, bank: wordBank })
      const allCards = [...result.columns.flat(), ...result.stock]
      const herrings = allCards.filter((c) => c.isRedHerring)
      for (const herring of herrings) {
        const source = wordBank.ambiguousWords.find((h) => h.word === herring.word)
        expect(source).toBeDefined()
        const hasLiveAlternate = source!.alternateCategories.some((alt) => result.categoriesUsed.includes(alt))
        expect(hasLiveAlternate).toBe(true)
      }
    }
  })

  it('always has at least one matchable group of 4 exposed at the start of the board', () => {
    for (let level = 1; level <= 30; level++) {
      const result = generateLevel({ levelNumber: level, seed: level * 65537, bank: wordBank })
      const active = activeCards(result.columns)
      const counts = new Map<string, number>()
      for (const card of active) {
        counts.set(card.trueCategoryId, (counts.get(card.trueCategoryId) ?? 0) + 1)
      }
      const hasImmediateMatch = Array.from(counts.values()).some((count) => count >= 4)
      expect(hasImmediateMatch).toBe(true)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = generateLevel({ levelNumber: 5, seed: 42, bank: wordBank })
    const b = generateLevel({ levelNumber: 5, seed: 42, bank: wordBank })
    expect(a.columns.map((c) => c.map((card) => card.word))).toEqual(b.columns.map((c) => c.map((card) => card.word)))
  })
})
