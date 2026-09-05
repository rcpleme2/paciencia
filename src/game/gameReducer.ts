import { wordBank } from '../data/categories'
import { emptyColumnCount, findColumnIndex, isBoardCleared } from './boardQueries'
import { generateLevel } from './levelGenerator'
import { validateMatch } from './matchValidation'
import { isBoardStuck } from './stuckDetection'
import type { GameAction, GameState } from './types'

export function createInitialLevelState(levelNumber: number, seed: number): GameState {
  const level = generateLevel({ levelNumber, seed, bank: wordBank })
  return {
    phase: 'playing',
    levelNumber,
    seed,
    tableau: level.columns,
    stock: level.stock,
    selected: [],
    mistakes: 0,
    maxMistakes: level.maxMistakes,
    movesMade: 0,
    lastMatchResult: null,
    lastMatchedCategory: null,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_LEVEL':
      return createInitialLevelState(action.levelNumber, action.seed)

    case 'SELECT_CARD': {
      if (state.phase !== 'playing') return state
      if (state.selected.includes(action.cardId)) return state
      const colIndex = findColumnIndex(state.tableau, action.cardId)
      if (colIndex === -1) return state

      const selected = [...state.selected, action.cardId]
      if (selected.length < 4) {
        return { ...state, selected }
      }

      const selectedCards = selected.map((id) => {
        for (const col of state.tableau) {
          const card = col.find((c) => c.id === id)
          if (card) return card
        }
        throw new Error('selected card not found')
      })

      const correct = validateMatch(selectedCards)
      if (correct) {
        const tableau = state.tableau.map((col) => {
          const top = col[col.length - 1]
          return top && selected.includes(top.id) ? col.slice(0, -1) : col
        })
        const stillStuck = isBoardStuck(tableau, state.stock)
        const cleared = isBoardCleared(tableau, state.stock)
        return {
          ...state,
          tableau,
          selected: [],
          movesMade: state.movesMade + 1,
          lastMatchResult: 'correct',
          lastMatchedCategory: selectedCards[0].trueCategoryId,
          phase: cleared ? 'won' : stillStuck ? 'lost' : 'playing',
        }
      }

      const mistakes = state.mistakes + 1
      return {
        ...state,
        selected,
        mistakes,
        movesMade: state.movesMade + 1,
        lastMatchResult: 'incorrect',
        phase: mistakes >= state.maxMistakes ? 'lost' : 'playing',
      }
    }

    case 'CLEAR_SELECTION':
      return { ...state, selected: [], lastMatchResult: null, lastMatchedCategory: null }

    case 'ACK_ANIMATION':
      return { ...state, lastMatchResult: null, lastMatchedCategory: null }

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
      const stuck = isBoardStuck(tableau, stock)
      return { ...state, tableau, stock, phase: stuck ? 'lost' : 'playing' }
    }

    default:
      return state
  }
}
