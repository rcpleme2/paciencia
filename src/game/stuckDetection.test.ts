import { describe, expect, it } from 'vitest'
import { isBoardStuck } from './stuckDetection'
import type { Card, Column } from './types'

function card(word: string, cat: string): Card {
  return { id: word, word, trueCategoryId: cat, isRedHerring: false }
}

describe('isBoardStuck', () => {
  it('is not stuck while stock still has cards', () => {
    const tableau: Column[] = [[card('a', 'x')], [card('b', 'y')]]
    expect(isBoardStuck(tableau, [card('c', 'z')])).toBe(false)
  })

  it('is stuck when stock is empty and no active category has 4 members', () => {
    const tableau: Column[] = [[card('a', 'x')], [card('b', 'y')], [card('c', 'z')]]
    expect(isBoardStuck(tableau, [])).toBe(true)
  })

  it('is not stuck when an active category already has 4 members', () => {
    const tableau: Column[] = [[card('a', 'x')], [card('b', 'x')], [card('c', 'x')], [card('d', 'x')]]
    expect(isBoardStuck(tableau, [])).toBe(false)
  })
})
