import { isActive } from '../game/boardQueries'
import type { Column as ColumnType } from '../game/types'
import { Card } from './Card'

const OVERLAP_PX = 32

export function Column({
  column,
  heldWordId,
  shakeCardId,
  onWordClick,
  onCategoryClick,
}: {
  column: ColumnType
  heldWordId: string | null
  shakeCardId: string | null
  onWordClick: (cardId: string) => void
  onCategoryClick: (cardId: string) => void
}) {
  return (
    <div className="column" style={{ minHeight: Math.max(150, (column.length - 1) * OVERLAP_PX + 130) }}>
      {column.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          isActive={isActive(column, card)}
          isHeld={card.id === heldWordId}
          shake={card.id === shakeCardId}
          onClick={() => (card.kind === 'category' ? onCategoryClick(card.id) : onWordClick(card.id))}
          style={{ top: i * OVERLAP_PX, zIndex: i }}
        />
      ))}
      {column.length === 0 && <div className="column__gap">vazio</div>}
    </div>
  )
}
