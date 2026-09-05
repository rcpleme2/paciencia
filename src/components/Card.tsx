import type { CSSProperties } from 'react'
import type { Card as CardType } from '../game/types'

export function Card({
  card,
  isActive,
  isHeld,
  shake,
  onClick,
  style,
}: {
  card: CardType
  isActive: boolean
  isHeld: boolean
  shake: boolean
  onClick: () => void
  style?: CSSProperties
}) {
  if (!isActive) {
    if (card.kind === 'word' && card.revealed) {
      return (
        <button className="card card--buried" style={style} disabled>
          <span className="card__word">{card.word}</span>
        </button>
      )
    }
    return (
      <button className="card card--locked" style={style} disabled>
        <span className="card__back" aria-hidden />
      </button>
    )
  }

  if (card.kind === 'category') {
    return (
      <button className="card card--category card--flip" style={style} onClick={onClick}>
        <span className="card__category-hint">Categoria</span>
        <span className="card__word">{card.label}</span>
        <span className="card__tap-hint">toque para revelar</span>
      </button>
    )
  }

  return (
    <button
      className={['card', 'card--active', 'card--flip', isHeld ? 'card--selected' : '', shake ? 'card--shake' : ''].join(' ')}
      style={style}
      onClick={onClick}
    >
      <span className="card__word">{card.word}</span>
    </button>
  )
}
