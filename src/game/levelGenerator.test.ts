import { describe, expect, it } from 'vitest'
import { wordBank } from '../data/categories'
import { activeCards } from './boardQueries'
import { generateLevel } from './levelGenerator'

describe('generateLevel', () => {
  it('produces exactly one category-marker card and `size` word cards per chosen category', () => {
    for (let level = 1; level <= 30; level += 3) {
      const result = generateLevel({ levelNumber: level, seed: level * 7919, bank: wordBank })
      const allCards = [...result.columns.flat(), ...result.stock]
      expect(allCards.length).toBe(result.totalCards)

      const markerCategoryIds = allCards.filter((c) => c.kind === 'category').map((c) => c.categoryId)
      expect(new Set(markerCategoryIds).size).toBe(result.categoriesUsed.length)
      expect(markerCategoryIds.length).toBe(result.categoriesUsed.length)

      for (const def of result.categoryDefs) {
        expect(def.size).toBeGreaterThanOrEqual(3)
        expect(def.size).toBeLessThanOrEqual(6)
        const wordCount = allCards.filter((c) => c.kind === 'word' && c.trueCategoryId === def.categoryId).length
        expect(wordCount).toBe(def.size)
      }
    }
  })

  it('deals an initial tableau of 8 to 12 cards', () => {
    for (let level = 1; level <= 20; level++) {
      const result = generateLevel({ levelNumber: level, seed: level * 12345, bank: wordBank })
      const initialCount = result.columns.flat().length
      expect(initialCount).toBeGreaterThanOrEqual(Math.min(8, result.totalCards))
      expect(initialCount).toBeLessThanOrEqual(12)
    }
  })

  it('only injects red herrings whose alternate category is present on the board', () => {
    for (let level = 4; level <= 30; level += 2) {
      const result = generateLevel({ levelNumber: level, seed: level * 104729, bank: wordBank })
      const allCards = [...result.columns.flat(), ...result.stock]
      const herrings = allCards.filter((c) => c.kind === 'word' && c.isRedHerring)
      for (const herring of herrings) {
        if (herring.kind !== 'word') continue
        const source = wordBank.ambiguousWords.find((h) => h.word === herring.word)
        expect(source).toBeDefined()
        const hasLiveAlternate = source!.alternateCategories.some((alt) => result.categoriesUsed.includes(alt))
        expect(hasLiveAlternate).toBe(true)
      }
    }
  })

  it('always has a promotable category card exposed at the start of the board', () => {
    for (let level = 1; level <= 30; level++) {
      const result = generateLevel({ levelNumber: level, seed: level * 65537, bank: wordBank })
      const active = activeCards(result.columns)
      expect(active.some((c) => c.kind === 'category')).toBe(true)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = generateLevel({ levelNumber: 5, seed: 42, bank: wordBank })
    const b = generateLevel({ levelNumber: 5, seed: 42, bank: wordBank })
    const describe = (r: typeof a) => r.columns.map((c) => c.map((card) => (card.kind === 'word' ? card.word : `#${card.label}`)))
    expect(describe(a)).toEqual(describe(b))
  })
})
