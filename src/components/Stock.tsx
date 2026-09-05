export function Stock({ count, canDraw, onDraw }: { count: number; canDraw: boolean; onDraw: () => void }) {
  return (
    <button className="stock" disabled={!canDraw} onClick={onDraw}>
      <span className="stock__label">Monte</span>
      <span className="stock__count">{count}</span>
    </button>
  )
}
