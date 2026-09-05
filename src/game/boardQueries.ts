import type { Card, Column } from './types'

export function isActive(column: Column, card: Card): boolean {
  const top = column[column.length - 1]
  return top !== undefined && top.id === card.id
}

export function activeCards(columns: Column[]): Card[] {
  return columns.map((col) => col[col.length - 1]).filter((c): c is Card => c !== undefined)
}

export function findColumnIndex(tableau: Column[], cardId: string): number {
  return tableau.findIndex((col) => col.length > 0 && col[col.length - 1].id === cardId)
}

export function isBoardCleared(tableau: Column[], waste: Column, stock: Card[]): boolean {
  return tableau.every((col) => col.length === 0) && waste.length === 0 && stock.length === 0
}
