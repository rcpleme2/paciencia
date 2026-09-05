import { describe, expect, it } from 'vitest'
import { gameReducer } from './gameReducer'
import type { GameState, WordCard } from './types'

function word(id: string, cat: string, revealed = false): WordCard {
  return { kind: 'word', id, word: id, trueCategoryId: cat, isRedHerring: false, revealed }
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: 'playing',
    levelNumber: 1,
    seed: 1,
    tableau: [],
    waste: [],
    stock: [],
    foundations: [],
    categorySizes: {},
    selectedWordId: null,
    mistakes: 0,
    maxMistakes: 6,
    movesMade: 0,
    lastAction: null,
    lastDepositCategory: null,
    ...overrides,
  }
}

describe('gameReducer stacking reveals buried cards', () => {
  it('marks a card as revealed once buried by a stacked card of the same category', () => {
    const a = word('a', 'x')
    const b = word('b', 'x')
    const state = baseState({ tableau: [[a], [b]] })

    const afterSelectA = gameReducer(state, { type: 'SELECT_WORD', cardId: 'a' })
    const afterStack = gameReducer(afterSelectA, { type: 'SELECT_WORD', cardId: 'b' })

    expect(afterStack.selectedWordId).toBeNull()
    expect(afterStack.tableau[0]).toEqual([])
    expect(afterStack.tableau[1].map((c) => c.id)).toEqual(['b', 'a'])
    // "b" was buried by "a" being stacked on top of it — it must stay
    // visible (revealed) instead of reverting to a face-down card.
    const buried = afterStack.tableau[1][0] as WordCard
    expect(buried.revealed).toBe(true)
    const top = afterStack.tableau[1][1] as WordCard
    expect(top.revealed).toBe(true)
  })

  it('does not stack cards of different categories, just switches the held card', () => {
    const a = word('a', 'x')
    const b = word('b', 'y')
    const state = baseState({ tableau: [[a], [b]] })

    const afterSelectA = gameReducer(state, { type: 'SELECT_WORD', cardId: 'a' })
    const afterSelectB = gameReducer(afterSelectA, { type: 'SELECT_WORD', cardId: 'b' })

    expect(afterSelectB.selectedWordId).toBe('b')
    expect(afterSelectB.tableau[0].map((c) => c.id)).toEqual(['a'])
    expect(afterSelectB.tableau[1].map((c) => c.id)).toEqual(['b'])
  })
})

describe('gameReducer MOVE_TO_EMPTY', () => {
  it('moves the held card into an empty tableau column', () => {
    const a = word('a', 'x')
    const state = baseState({ tableau: [[a], []], selectedWordId: 'a' })

    const next = gameReducer(state, { type: 'MOVE_TO_EMPTY', colIndex: 1 })

    expect(next.tableau[0]).toEqual([])
    expect(next.tableau[1].map((c) => c.id)).toEqual(['a'])
    expect(next.selectedWordId).toBeNull()
  })

  it('does nothing if the target column is not empty', () => {
    const a = word('a', 'x')
    const b = word('b', 'y')
    const state = baseState({ tableau: [[a], [b]], selectedWordId: 'a' })

    const next = gameReducer(state, { type: 'MOVE_TO_EMPTY', colIndex: 1 })

    expect(next).toBe(state)
  })

  it('does nothing if no word is currently held', () => {
    const state = baseState({ tableau: [[], []], selectedWordId: null })
    const next = gameReducer(state, { type: 'MOVE_TO_EMPTY', colIndex: 0 })
    expect(next).toBe(state)
  })
})
