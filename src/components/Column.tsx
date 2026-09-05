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
  onEmptyClick,
}: {
  column: ColumnType
  heldWordId: string | null
  shakeCardId: string | null
  onWordClick: (cardId: string) => void
  onCategoryClick: (cardId: string) => void
  onEmptyClick?: () => void
}) {
  const isHolding = heldWordId !== null
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
      {column.length > 1 && <span className="column__count">×{column.length}</span>}
      {column.length === 0 &&
        (onEmptyClick ? (
          <button
            className={['column__gap', 'column__gap--clickable', isHolding ? 'column__gap--targetable' : ''].join(' ')}
            onClick={onEmptyClick}
          >
            vazio
          </button>
        ) : (
          <div className="column__gap">vazio</div>
        ))}
    </div>
  )
}
