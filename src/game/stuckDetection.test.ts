import { describe, expect, it } from 'vitest'
import { isBoardStuck } from './stuckDetection'
import type { Card, Column, Foundation } from './types'

function word(id: string, cat: string): Card {
  return { kind: 'word', id, word: id, trueCategoryId: cat, isRedHerring: false, revealed: true }
}

function marker(id: string, cat: string): Card {
  return { kind: 'category', id, categoryId: cat, label: cat }
}

describe('isBoardStuck', () => {
  it('is not stuck while stock still has cards', () => {
    const tableau: Column[] = [[word('a', 'x')], [word('b', 'y')]]
    expect(isBoardStuck(tableau, [], [word('c', 'z')], [])).toBe(false)
  })

  it('is not stuck when a category-marker card is active in the tableau', () => {
    const tableau: Column[] = [[marker('m', 'x')], [word('b', 'y')]]
    expect(isBoardStuck(tableau, [], [], [])).toBe(false)
  })

  it('is not stuck when the waste pile top is a promotable category card', () => {
    const tableau: Column[] = [[word('a', 'x')]]
    expect(isBoardStuck(tableau, [marker('m', 'z')], [], [])).toBe(false)
  })

  it('is not stuck when an active word card has a matching foundation', () => {
    const tableau: Column[] = [[word('a', 'x')], [word('b', 'y')]]
    const foundations: Foundation[] = [{ categoryId: 'x', label: 'X', size: 4, progress: 1 }]
    expect(isBoardStuck(tableau, [], [], foundations)).toBe(false)
  })

  it('is not stuck when the waste top word matches a foundation', () => {
    const tableau: Column[] = [[word('a', 'y')]]
    const foundations: Foundation[] = [{ categoryId: 'x', label: 'X', size: 4, progress: 1 }]
    expect(isBoardStuck(tableau, [word('w', 'x')], [], foundations)).toBe(false)
  })

  it('is stuck when no active card is promotable or depositable and stock is empty', () => {
    const tableau: Column[] = [[word('a', 'x')], [word('b', 'y')]]
    const foundations: Foundation[] = [{ categoryId: 'z', label: 'Z', size: 4, progress: 0 }]
    expect(isBoardStuck(tableau, [], [], foundations)).toBe(true)
  })
})
