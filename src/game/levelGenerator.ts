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

  const allCards = shuffle(rng, Array.from(cardsByCategory.values()).flat())
  const totalCards = allCards.length

  const stockCount = Math.min(totalCards - params.columns, Math.round(totalCards * params.stockFraction))
  const stock = allCards.slice(0, stockCount)
  const tableauCards = allCards.slice(stockCount)

  const columns: Column[] = Array.from({ length: params.columns }, () => [])
  tableauCards.forEach((card, i) => {
    columns[i % params.columns].push(card)
  })

  return { columns, stock, totalCards, categoriesUsed, maxMistakes: params.maxMistakes }
}
