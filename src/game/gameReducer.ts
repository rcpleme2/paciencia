import { wordBank } from '../data/categories'
import { findColumnIndex, isBoardCleared } from './boardQueries'
import { generateLevel } from './levelGenerator'
import { isBoardStuck } from './stuckDetection'
import type { Card, Column, GameAction, GameState } from './types'

export function createInitialLevelState(levelNumber: number, seed: number): GameState {
  const level = generateLevel({ levelNumber, seed, bank: wordBank })
  const categorySizes: GameState['categorySizes'] = {}
  for (const def of level.categoryDefs) {
    categorySizes[def.categoryId] = { label: def.label, size: def.size }
  }
  return revealTopsInState({
    phase: 'playing',
    levelNumber,
    seed,
    tableau: level.columns,
    waste: [],
    stock: level.stock,
    foundations: [],
    categorySizes,
    selectedWordId: null,
    mistakes: 0,
    maxMistakes: level.maxMistakes,
    movesMade: 0,
    lastAction: null,
    lastDepositCategory: null,
  })
}

type CardLocation = { zone: 'tableau'; colIndex: number } | { zone: 'waste' }

function findActiveCard(state: GameState, cardId: string): { location: CardLocation; card: Card } | null {
  const colIndex = findColumnIndex(state.tableau, cardId)
  if (colIndex !== -1) {
    const column = state.tableau[colIndex]
    return { location: { zone: 'tableau', colIndex }, card: column[column.length - 1] }
  }
  const wasteTop = state.waste[state.waste.length - 1]
  if (wasteTop && wasteTop.id === cardId) {
    return { location: { zone: 'waste' }, card: wasteTop }
  }
  return null
}

function removeActiveCard(state: GameState, location: CardLocation): { tableau: Column[]; waste: Column } {
  if (location.zone === 'waste') {
    return { tableau: state.tableau, waste: state.waste.slice(0, -1) }
  }
  const tableau = state.tableau.map((col, i) => (i === location.colIndex ? col.slice(0, -1) : col))
  return { tableau, waste: state.waste }
}

function appendCard(tableau: Column[], waste: Column, location: CardLocation, card: Card): { tableau: Column[]; waste: Column } {
  if (location.zone === 'waste') {
    return { tableau, waste: [...waste, card] }
  }
  return { tableau: tableau.map((col, i) => (i === location.colIndex ? [...col, card] : col)), waste }
}

// Once a card has ever been on top of its column (i.e. visible/active), it
// stays visible forever, even if later buried under a card the player
// stacks on top of it — same convention as classic solitaire, and what
// makes player-built same-category piles show every card underneath.
function revealTop(column: Column): Column {
  if (column.length === 0) return column
  const top = column[column.length - 1]
  if (top.kind !== 'word' || top.revealed) return column
  return [...column.slice(0, -1), { ...top, revealed: true }]
}

function revealTopsInState(state: GameState): GameState {
  return { ...state, tableau: state.tableau.map(revealTop), waste: revealTop(state.waste) }
}

function gameReducerCore(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_LEVEL':
      return createInitialLevelState(action.levelNumber, action.seed)

    case 'SELECT_WORD': {
      if (state.phase !== 'playing') return state
      const found = findActiveCard(state, action.cardId)
      if (!found || found.card.kind !== 'word') return state

      if (state.selectedWordId === action.cardId) {
        return { ...state, selectedWordId: null }
      }

      if (state.selectedWordId) {
        const held = findActiveCard(state, state.selectedWordId)
        if (held && held.card.kind === 'word' && held.card.trueCategoryId === found.card.trueCategoryId) {
          const removed = removeActiveCard(state, held.location)
          const appended = appendCard(removed.tableau, removed.waste, found.location, held.card)
          return { ...state, tableau: appended.tableau, waste: appended.waste, selectedWordId: null, lastAction: 'stack' }
        }
      }

      return { ...state, selectedWordId: action.cardId }
    }

    case 'PROMOTE_CATEGORY': {
      if (state.phase !== 'playing') return state
      const found = findActiveCard(state, action.cardId)
      if (!found || found.card.kind !== 'category') return state
      const marker = found.card
      if (state.foundations.some((f) => f.categoryId === marker.categoryId)) return state

      const removed = removeActiveCard(state, found.location)
      const sizeInfo = state.categorySizes[marker.categoryId]
      const foundations = [
        ...state.foundations,
        { categoryId: marker.categoryId, label: marker.label, size: sizeInfo?.size ?? 4, progress: 0 },
      ]
      return { ...state, tableau: removed.tableau, waste: removed.waste, foundations, lastAction: 'promote' }
    }

    case 'DEPOSIT': {
      if (state.phase !== 'playing') return state
      if (!state.selectedWordId) return state
      const found = findActiveCard(state, state.selectedWordId)
      if (!found || found.card.kind !== 'word') return state
      const foundationIndex = state.foundations.findIndex((f) => f.categoryId === action.categoryId)
      if (foundationIndex === -1) return state

      const word = found.card
      const correct = word.trueCategoryId === action.categoryId

      if (correct) {
        const removed = removeActiveCard(state, found.location)
        const foundations = state.foundations.map((f, i) => (i === foundationIndex ? { ...f, progress: f.progress + 1 } : f))
        const stillStuck = isBoardStuck(removed.tableau, removed.waste, state.stock, foundations)
        const cleared = isBoardCleared(removed.tableau, removed.waste, state.stock)
        return {
          ...state,
          tableau: removed.tableau,
          waste: removed.waste,
          foundations,
          selectedWordId: null,
          movesMade: state.movesMade + 1,
          lastAction: 'deposit-correct',
          lastDepositCategory: action.categoryId,
          phase: cleared ? 'won' : stillStuck ? 'lost' : 'playing',
        }
      }

      const mistakes = state.mistakes + 1
      return {
        ...state,
        mistakes,
        movesMade: state.movesMade + 1,
        lastAction: 'deposit-wrong',
        lastDepositCategory: action.categoryId,
        phase: mistakes >= state.maxMistakes ? 'lost' : 'playing',
      }
    }

    case 'MOVE_TO_EMPTY': {
      if (state.phase !== 'playing') return state
      if (!state.selectedWordId) return state
      if (state.tableau[action.colIndex]?.length !== 0) return state

      const found = findActiveCard(state, state.selectedWordId)
      if (!found) return state
      if (found.location.zone === 'tableau' && found.location.colIndex === action.colIndex) return state

      const removed = removeActiveCard(state, found.location)
      const tableau = removed.tableau.map((col, i) => (i === action.colIndex ? [found.card] : col))
      return { ...state, tableau, waste: removed.waste, selectedWordId: null, lastAction: 'stack' }
    }

    case 'ACK_ANIMATION':
      return {
        ...state,
        lastAction: null,
        lastDepositCategory: null,
        selectedWordId: state.lastAction === 'deposit-wrong' ? null : state.selectedWordId,
      }

    case 'DRAW_STOCK': {
      if (state.phase !== 'playing') return state
      if (state.stock.length === 0) return state

      const stock = [...state.stock]
      const drawn = stock.pop()!
      const waste = [...state.waste, drawn]
      const stuck = isBoardStuck(state.tableau, waste, stock, state.foundations)
      return { ...state, stock, waste, phase: stuck ? 'lost' : 'playing' }
    }

    default:
      return state
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const next = gameReducerCore(state, action)
  if (next === state) return next
  return revealTopsInState(next)
}
