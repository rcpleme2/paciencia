export function Hud({
  levelNumber,
  mistakes,
  maxMistakes,
  profileName,
  onSwitchProfile,
}: {
  levelNumber: number
  mistakes: number
  maxMistakes: number
  profileName: string
  onSwitchProfile: () => void
}) {
  return (
    <div className="hud">
      <div className="hud__stat">
        <span className="hud__label">Nível</span>
        <span className="hud__value">{levelNumber}</span>
      </div>
      <div className="hud__stat">
        <span className="hud__label">Erros</span>
        <span className="hud__value">
          {mistakes} / {maxMistakes}
        </span>
      </div>
      <button className="hud__profile" onClick={onSwitchProfile}>
        {profileName} · trocar
      </button>
    </div>
  )
}
