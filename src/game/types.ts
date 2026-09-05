export type CategoryId = string

export interface Category {
  id: CategoryId
  label: string
  words: string[]
}

export interface AmbiguousWord {
  word: string
  trueCategory: CategoryId
  alternateCategories: CategoryId[]
}

export interface WordBank {
  categories: Category[]
  ambiguousWords: AmbiguousWord[]
}

export interface Card {
  id: string
  word: string
  trueCategoryId: CategoryId
  isRedHerring: boolean
}

export type Column = Card[]

export interface DifficultyParams {
  totalCards: number
  columns: number
  redHerringCount: number
  stockFraction: number
  maxMistakes: number
}

export type GamePhase = 'playing' | 'won' | 'lost'

export type MatchResult = 'correct' | 'incorrect' | null

export interface GameState {
  phase: GamePhase
  levelNumber: number
  seed: number
  tableau: Column[]
  stock: Card[]
  selected: string[]
  mistakes: number
  maxMistakes: number
  movesMade: number
  lastMatchResult: MatchResult
  lastMatchedCategory: CategoryId | null
}

export type GameAction =
  | { type: 'START_LEVEL'; levelNumber: number; seed: number }
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'DRAW_STOCK' }
  | { type: 'ACK_ANIMATION' }
