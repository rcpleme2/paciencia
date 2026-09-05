import { isActive } from '../game/boardQueries'
import type { Column as ColumnType } from '../game/types'
import { Card } from './Card'

const OVERLAP_PX = 34

export function Column({
  column,
  selected,
  shake,
  onCardClick,
}: {
  column: ColumnType
  selected: string[]
  shake: boolean
  onCardClick: (cardId: string) => void
}) {
  return (
    <div className="column" style={{ minHeight: Math.max(140, column.length * OVERLAP_PX + 110) }}>
      {column.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          isActive={isActive(column, card)}
          selectionOrder={selected.indexOf(card.id)}
          shake={shake && selected.includes(card.id)}
          onClick={() => onCardClick(card.id)}
          style={{ top: i * OVERLAP_PX, zIndex: i }}
        />
      ))}
      {column.length === 0 && <div className="column__gap">vazio</div>}
    </div>
  )
}
