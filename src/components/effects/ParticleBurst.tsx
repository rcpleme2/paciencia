const DOTS = Array.from({ length: 12 }, (_, i) => i)

export function ParticleBurst() {
  return (
    <div className="particle-burst" aria-hidden>
      {DOTS.map((i) => (
        <span
          key={i}
          className="particle-burst__dot"
          style={{
            transform: `rotate(${(360 / DOTS.length) * i}deg) translateY(-40px)`,
            animationDelay: `${(i % 4) * 15}ms`,
          }}
        />
      ))}
    </div>
  )
}
