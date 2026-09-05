import { describe, expect, it } from 'vitest'
import { validateMatch } from './matchValidation'
import type { Card } from './types'

function card(word: string, cat: string): Card {
  return { id: word, word, trueCategoryId: cat, isRedHerring: false }
}

describe('validateMatch', () => {
  it('accepts four cards sharing the same true category', () => {
    const cards = [card('a', 'x'), card('b', 'x'), card('c', 'x'), card('d', 'x')]
    expect(validateMatch(cards)).toBe(true)
  })

  it('rejects a mismatched category', () => {
    const cards = [card('a', 'x'), card('b', 'x'), card('c', 'x'), card('d', 'y')]
    expect(validateMatch(cards)).toBe(false)
  })

  it('rejects fewer than four cards', () => {
    const cards = [card('a', 'x'), card('b', 'x'), card('c', 'x')]
    expect(validateMatch(cards)).toBe(false)
  })
})
