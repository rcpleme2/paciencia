import { wordBank } from '../data/categories'
import { emptyColumnCount, findColumnIndex, isBoardCleared } from './boardQueries'
import { generateLevel } from './levelGenerator'
import { isBoardStuck } from './stuckDetection'
import type { GameAction, GameState } from './types'

export function createInitialLevelState(levelNumber: number, seed: number): GameState {
  const level = generateLevel({ levelNumber, seed, bank: wordBank })
  const categorySizes: GameState['categorySizes'] = {}
  for (const def of level.categoryDefs) {
    categorySizes[def.categoryId] = { label: def.label, size: def.size }
  }
  return {
    phase: 'playing',
    levelNumber,
    seed,
    tableau: level.columns,
    stock: level.stock,
    foundations: [],
    categorySizes,
    selectedWordId: null,
    mistakes: 0,
    maxMistakes: level.maxMistakes,
    movesMade: 0,
    lastAction: null,
    lastDepositCategory: null,
  }
}

function findActiveCard(tableau: GameState['tableau'], cardId: string) {
  const colIndex = findColumnIndex(tableau, cardId)
  if (colIndex === -1) return null
  const column = tableau[colIndex]
  const card = column[column.length - 1]
  return { colIndex, card }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_LEVEL':
      return createInitialLevelState(action.levelNumber, action.seed)

    case 'SELECT_WORD': {
      if (state.phase !== 'playing') return state
      const found = findActiveCard(state.tableau, action.cardId)
      if (!found || found.card.kind !== 'word') return state
      const selectedWordId = state.selectedWordId === action.cardId ? null : action.cardId
      return { ...state, selectedWordId }
    }

    case 'PROMOTE_CATEGORY': {
      if (state.phase !== 'playing') return state
      const found = findActiveCard(state.tableau, action.cardId)
      if (!found || found.card.kind !== 'category') return state
      const marker = found.card
      if (state.foundations.some((f) => f.categoryId === marker.categoryId)) return state

      const tableau = state.tableau.map((col, i) => (i === found.colIndex ? col.slice(0, -1) : col))
      const sizeInfo = state.categorySizes[marker.categoryId]
      const foundations = [
        ...state.foundations,
        { categoryId: marker.categoryId, label: marker.label, size: sizeInfo?.size ?? 4, progress: 0 },
      ]
      return { ...state, tableau, foundations, lastAction: 'promote' }
    }

    case 'DEPOSIT': {
      if (state.phase !== 'playing') return state
      if (!state.selectedWordId) return state
      const found = findActiveCard(state.tableau, state.selectedWordId)
      if (!found || found.card.kind !== 'word') return state
      const foundationIndex = state.foundations.findIndex((f) => f.categoryId === action.categoryId)
      if (foundationIndex === -1) return state

      const word = found.card
      const correct = word.trueCategoryId === action.categoryId

      if (correct) {
        const tableau = state.tableau.map((col, i) => (i === found.colIndex ? col.slice(0, -1) : col))
        const foundations = state.foundations.map((f, i) => (i === foundationIndex ? { ...f, progress: f.progress + 1 } : f))
        const stillStuck = isBoardStuck(tableau, state.stock, foundations)
        const cleared = isBoardCleared(tableau, state.stock)
        return {
          ...state,
          tableau,
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

    case 'ACK_ANIMATION':
      return {
        ...state,
        lastAction: null,
        lastDepositCategory: null,
        selectedWordId: state.lastAction === 'deposit-wrong' ? null : state.selectedWordId,
      }

    case 'DRAW_STOCK': {
      if (state.phase !== 'playing') return state
      const gaps = emptyColumnCount(state.tableau)
      if (gaps === 0 || state.stock.length === 0) return state

      const stock = [...state.stock]
      const tableau = state.tableau.map((col) => [...col])
      for (const col of tableau) {
        if (col.length === 0 && stock.length > 0) {
          col.push(stock.pop()!)
        }
      }
      const stuck = isBoardStuck(tableau, stock, state.foundations)
      return { ...state, tableau, stock, phase: stuck ? 'lost' : 'playing' }
    }

    default:
      return state
  }
}
