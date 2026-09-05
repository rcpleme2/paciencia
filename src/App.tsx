import { useState } from 'react'
import './App.css'
import { Board } from './components/Board'
import { Hud } from './components/Hud'
import { LoseModal } from './components/LoseModal'
import { ProfileSelect } from './components/ProfileSelect'
import { WinModal } from './components/WinModal'
import { clearActiveProfile, getActiveProfileId, listProfiles } from './persistence/profiles'
import { GameProvider } from './state/GameProvider'
import { useGame } from './state/useGame'

function GameScreen({ profileName, onSwitchProfile }: { profileName: string; onSwitchProfile: () => void }) {
  const { state, goToNextLevel, retryLevel } = useGame()
  return (
    <div className="app">
      <Hud
        levelNumber={state.levelNumber}
        mistakes={state.mistakes}
        maxMistakes={state.maxMistakes}
        profileName={profileName}
        onSwitchProfile={onSwitchProfile}
      />
      <Board />
      {state.phase === 'won' && <WinModal levelNumber={state.levelNumber} onNext={goToNextLevel} />}
      {state.phase === 'lost' && <LoseModal onRetry={retryLevel} />}
    </div>
  )
}

export default function App() {
  const [profileId, setProfileId] = useState<string | null>(() => getActiveProfileId())

  if (!profileId) {
    return <ProfileSelect onSelect={setProfileId} />
  }

  const profileName = listProfiles().find((p) => p.id === profileId)?.name ?? 'Jogador'

  return (
    <GameProvider key={profileId} profileId={profileId}>
      <GameScreen
        profileName={profileName}
        onSwitchProfile={() => {
          clearActiveProfile()
          setProfileId(null)
        }}
      />
    </GameProvider>
  )
}
