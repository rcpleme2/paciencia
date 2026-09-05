import { useMemo, type CSSProperties } from 'react'
import type { Card as CardType } from '../game/types'

const SELECTION_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

export function Card({
  card,
  isActive,
  selectionOrder,
  shake,
  onClick,
  style,
}: {
  card: CardType
  isActive: boolean
  selectionOrder: number
  shake: boolean
  onClick: () => void
  style?: CSSProperties
}) {
  const selected = selectionOrder >= 0
  const borderColor = useMemo(() => (selected ? SELECTION_COLORS[selectionOrder % SELECTION_COLORS.length] : undefined), [selected, selectionOrder])

  return (
    <button
      className={['card', isActive ? 'card--active' : 'card--locked', selected ? 'card--selected' : '', shake ? 'card--shake' : ''].join(' ')}
      style={{ ...style, borderColor }}
      disabled={!isActive}
      onClick={onClick}
    >
      <span className="card__word">{card.word}</span>
    </button>
  )
}
