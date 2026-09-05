import { difficulty } from './difficulty'
import { mulberry32, pickRandom, randomInt, shuffle } from './rng'
import type { Card, CategoryId, CategoryMarkerCard, Column, WordBank, WordCard } from './types'

export interface GenerateLevelInput {
  levelNumber: number
  seed: number
  bank: WordBank
  recentlyUsedWords?: Set<string>
}

export interface CategoryDef {
  categoryId: CategoryId
  label: string
  size: number
}

export interface GenerateLevelOutput {
  columns: Column[]
  stock: Card[]
  totalCards: number
  categoriesUsed: CategoryId[]
  categoryDefs: CategoryDef[]
  maxMistakes: number
}

let uid = 0
function nextId(): string {
  uid += 1
  return `card-${uid}-${Date.now().toString(36)}`
}

const MIN_CATEGORY_SIZE = 3
const MAX_CATEGORY_SIZE = 6

export function generateLevel({ levelNumber, seed, bank, recentlyUsedWords }: GenerateLevelInput): GenerateLevelOutput {
  const params = difficulty(levelNumber)
  const rng = mulberry32(seed)
  const recentlyUsed = recentlyUsedWords ?? new Set<string>()

  const eligible = bank.categories.filter((c) => c.words.filter((w) => !recentlyUsed.has(w)).length >= MIN_CATEGORY_SIZE)
  const pool = eligible.length >= params.categoryCount ? eligible : bank.categories
  const chosenCategories = pickRandom(rng, pool, params.categoryCount)
  const categoriesUsed = chosenCategories.map((c) => c.id)

  const wordCardsByCategory = new Map<CategoryId, WordCard[]>()
  const categoryDefs: CategoryDef[] = []

  for (const category of chosenCategories) {
    const freshWords = category.words.filter((w) => !recentlyUsed.has(w))
    const wordsToUse = freshWords.length >= MIN_CATEGORY_SIZE ? freshWords : category.words
    const desiredSize = randomInt(rng, MIN_CATEGORY_SIZE, MAX_CATEGORY_SIZE)
    const words = pickRandom(rng, wordsToUse, desiredSize)
    wordCardsByCategory.set(
      category.id,
      words.map((word) => ({ kind: 'word', id: nextId(), word, trueCategoryId: category.id, isRedHerring: false })),
    )
    categoryDefs.push({ categoryId: category.id, label: category.label, size: words.length })
  }

  const liveHerrings = shuffle(
    rng,
    bank.ambiguousWords.filter(
      (h) => categoriesUsed.includes(h.trueCategory) && h.alternateCategories.some((alt) => categoriesUsed.includes(alt)),
    ),
  ).slice(0, params.redHerringCount)

  for (const herring of liveHerrings) {
    const group = wordCardsByCategory.get(herring.trueCategory)
    if (!group || group.some((c) => c.word === herring.word)) continue
    group[0] = { kind: 'word', id: nextId(), word: herring.word, trueCategoryId: herring.trueCategory, isRedHerring: true }
  }

  const categoryMarkers: CategoryMarkerCard[] = chosenCategories.map((category) => ({
    kind: 'category',
    id: nextId(),
    categoryId: category.id,
    label: category.label,
  }))

  const allCards: Card[] = shuffle(rng, [...Array.from(wordCardsByCategory.values()).flat(), ...categoryMarkers])
  const totalCards = allCards.length

  const initialTableauCount = Math.min(randomInt(rng, 8, 12), totalCards)
  const tableauPool = allCards.slice(0, initialTableauCount)
  const stockPool = allCards.slice(initialTableauCount)

  // Guarantee at least one category card is dealt into the initial tableau,
  // so the player always has an immediate, valid first move available
  // (promoting it into a foundation).
  if (!tableauPool.some((c) => c.kind === 'category')) {
    const markerIndex = stockPool.findIndex((c) => c.kind === 'category')
    if (markerIndex !== -1) {
      const [marker] = stockPool.splice(markerIndex, 1)
      stockPool.push(tableauPool.pop()!)
      tableauPool.push(marker)
    }
  }

  const columns: Column[] = Array.from({ length: params.columns }, () => [])
  tableauPool.forEach((card, i) => {
    columns[i % params.columns].push(card)
  })

  // Guarantee a category card ends up on top (active) of some column, so
  // the very first tap is always a valid, useful move.
  if (!columns.some((col) => col.length > 0 && col[col.length - 1].kind === 'category')) {
    for (const col of columns) {
      const markerIdx = col.findIndex((c) => c.kind === 'category')
      if (markerIdx !== -1 && markerIdx !== col.length - 1) {
        const [marker] = col.splice(markerIdx, 1)
        col.push(marker)
        break
      }
    }
  }

  const stock = shuffle(rng, stockPool)

  return { columns, stock, totalCards, categoriesUsed, categoryDefs, maxMistakes: params.maxMistakes }
}
