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

export interface WordCard {
  kind: 'word'
  id: string
  word: string
  trueCategoryId: CategoryId
  isRedHerring: boolean
}

export interface CategoryMarkerCard {
  kind: 'category'
  id: string
  categoryId: CategoryId
  label: string
}

export type Card = WordCard | CategoryMarkerCard

export type Column = Card[]

export interface Foundation {
  categoryId: CategoryId
  label: string
  size: number
  progress: number
}

export interface DifficultyParams {
  categoryCount: number
  columns: number
  redHerringCount: number
  maxMistakes: number
}

export type GamePhase = 'playing' | 'won' | 'lost'

export type LastAction = 'promote' | 'deposit-correct' | 'deposit-wrong' | 'stack' | null

export interface CategorySize {
  label: string
  size: number
}

export interface GameState {
  phase: GamePhase
  levelNumber: number
  seed: number
  tableau: Column[]
  waste: Column
  stock: Card[]
  foundations: Foundation[]
  categorySizes: Record<CategoryId, CategorySize>
  selectedWordId: string | null
  mistakes: number
  maxMistakes: number
  movesMade: number
  lastAction: LastAction
  lastDepositCategory: CategoryId | null
}

export type GameAction =
  | { type: 'START_LEVEL'; levelNumber: number; seed: number }
  | { type: 'SELECT_WORD'; cardId: string }
  | { type: 'PROMOTE_CATEGORY'; cardId: string }
  | { type: 'DEPOSIT'; categoryId: CategoryId }
  | { type: 'DRAW_STOCK' }
  | { type: 'ACK_ANIMATION' }
