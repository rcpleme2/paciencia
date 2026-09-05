import type { Foundation } from '../game/types'

export function Foundations({
  foundations,
  isHolding,
  shakeCategoryId,
  onDeposit,
}: {
  foundations: Foundation[]
  isHolding: boolean
  shakeCategoryId: string | null
  onDeposit: (categoryId: string) => void
}) {
  if (foundations.length === 0) {
    return <div className="foundations foundations--empty">Revele uma carta de categoria para começar</div>
  }

  return (
    <div className="foundations">
      {foundations.map((f) => (
        <button
          key={f.categoryId}
          className={[
            'foundation',
            f.progress >= f.size ? 'foundation--complete' : '',
            isHolding ? 'foundation--targetable' : '',
            f.categoryId === shakeCategoryId ? 'foundation--shake' : '',
          ].join(' ')}
          disabled={f.progress >= f.size}
          onClick={() => onDeposit(f.categoryId)}
        >
          <span className="foundation__label">{f.label}</span>
          <span className="foundation__progress">
            {f.progress}/{f.size}
          </span>
        </button>
      ))}
    </div>
  )
}
