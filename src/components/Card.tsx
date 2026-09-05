import type { CSSProperties } from 'react'
import type { Card as CardType } from '../game/types'

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

  return (
    <button
      className={[
        'card',
        isActive ? 'card--active card--flip' : 'card--locked',
        selected ? 'card--selected' : '',
        shake ? 'card--shake' : '',
      ].join(' ')}
      style={style}
      disabled={!isActive}
      onClick={onClick}
    >
      {isActive ? (
        <span className="card__word">{card.word}</span>
      ) : (
        <span className="card__back" aria-hidden />
      )}
      {selected && <span className={`card__badge card__badge--${selectionOrder}`}>{selectionOrder + 1}</span>}
    </button>
  )
}
