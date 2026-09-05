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
  const mistakesLeft = maxMistakes - mistakes

  return (
    <div className="hud">
      <div className="hud__ribbon">
        <span className="hud__ribbon-label">Nível</span>
        <span className="hud__ribbon-value">{levelNumber}</span>
      </div>

      <div className="hud__pill" title="Chances restantes">
        <span className="hud__pill-icon">♥</span>
        <span className="hud__pill-value">{mistakesLeft}</span>
      </div>

      <button className="hud__profile" onClick={onSwitchProfile}>
        {profileName}
      </button>
    </div>
  )
}
