export function Stock({ count, canDraw, onDraw }: { count: number; canDraw: boolean; onDraw: () => void }) {
  return (
    <button className="stock" disabled={!canDraw} onClick={onDraw} aria-label="Comprar do monte">
      <span className="stock__fan" aria-hidden>
        <span className="stock__card stock__card--3" />
        <span className="stock__card stock__card--2" />
        <span className="stock__card stock__card--1" />
      </span>
      <span className="stock__count">{count}</span>
    </button>
  )
}
