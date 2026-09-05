import { difficulty } from './difficulty'
import { mulberry32, pickRandom, shuffle } from './rng'
import type { Card, CategoryId, Column, WordBank } from './types'

export interface GenerateLevelInput {
  levelNumber: number
  seed: number
  bank: WordBank
  recentlyUsedWords?: Set<string>
}

export interface GenerateLevelOutput {
  columns: Column[]
  stock: Card[]
  totalCards: number
  categoriesUsed: CategoryId[]
  maxMistakes: number
}

let uid = 0
function nextId(): string {
  uid += 1
  return `card-${uid}-${Date.now().toString(36)}`
}

export function generateLevel({ levelNumber, seed, bank, recentlyUsedWords }: GenerateLevelInput): GenerateLevelOutput {
  const params = difficulty(levelNumber)
  const rng = mulberry32(seed)
  const groupCount = params.totalCards / 4
  const recentlyUsed = recentlyUsedWords ?? new Set<string>()

  const eligible = bank.categories.filter((c) => c.words.filter((w) => !recentlyUsed.has(w)).length >= 4)
  const pool = eligible.length >= groupCount ? eligible : bank.categories
  const chosenCategories = pickRandom(rng, pool, groupCount)
  const categoriesUsed = chosenCategories.map((c) => c.id)

  const cardsByCategory = new Map<CategoryId, Card[]>()
  for (const category of chosenCategories) {
    const freshWords = category.words.filter((w) => !recentlyUsed.has(w))
    const wordsToUse = freshWords.length >= 4 ? freshWords : category.words
    const words = pickRandom(rng, wordsToUse, 4)
    cardsByCategory.set(
      category.id,
      words.map((word) => ({ id: nextId(), word, trueCategoryId: category.id, isRedHerring: false })),
    )
  }

  const liveHerrings = shuffle(
    rng,
    bank.ambiguousWords.filter(
      (h) => categoriesUsed.includes(h.trueCategory) && h.alternateCategories.some((alt) => categoriesUsed.includes(alt)),
    ),
  ).slice(0, params.redHerringCount)

  for (const herring of liveHerrings) {
    const group = cardsByCategory.get(herring.trueCategory)
    if (!group || group.some((c) => c.word === herring.word)) continue
    group[0] = { id: nextId(), word: herring.word, trueCategoryId: herring.trueCategory, isRedHerring: true }
  }

  const groups = shuffle(rng, Array.from(cardsByCategory.values()))
  const stockGroupCount = Math.min(groups.length - 1, Math.round(groups.length * params.stockFraction))
  const stockGroups = groups.slice(0, stockGroupCount)
  const tableauGroups = groups.slice(stockGroupCount)

  // Push each category's 4 cards together onto the 4 currently-shortest
  // columns, one card per column. This guarantees the most-recently-placed
  // group is always fully exposed (all 4 members on top of their columns),
  // so there is always at least one valid match available — the board can
  // never be stuck from the very first move.
  const columns: Column[] = Array.from({ length: params.columns }, () => [])
  for (const group of tableauGroups) {
    const targetColumns = columns
      .map((_, index) => index)
      .sort((a, b) => columns[a].length - columns[b].length)
      .slice(0, 4)
    const shuffledCards = shuffle(rng, group)
    targetColumns.forEach((colIndex, i) => columns[colIndex].push(shuffledCards[i]))
  }

  const stock = shuffle(rng, stockGroups.flat())
  const totalCards = tableauGroups.length * 4 + stock.length

  return { columns, stock, totalCards, categoriesUsed, maxMistakes: params.maxMistakes }
}
