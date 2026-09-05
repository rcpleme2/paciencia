import { createContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { createInitialLevelState, gameReducer } from '../game/gameReducer'
import type { GameAction, GameState } from '../game/types'
import { loadSave, saveSave } from '../persistence/storage'
import type { SaveDataV1 } from '../persistence/saveSchema'

export interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  save: SaveDataV1
  goToNextLevel: () => void
  retryLevel: () => void
}

export const GameContext = createContext<GameContextValue | null>(null)

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function GameProvider({ profileId, children }: { profileId: string; children: ReactNode }) {
  const initialSave = useMemo(() => loadSave(profileId), [profileId])
  const [save, setSave] = useState(initialSave)
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialLevelState(initialSave.currentLevelNumber, randomSeed()),
  )

  useEffect(() => {
    if (state.phase === 'won') {
      setSave((prev) => {
        const next: SaveDataV1 = {
          ...prev,
          currentLevelNumber: prev.currentLevelNumber + 1,
          highestLevelReached: Math.max(prev.highestLevelReached, prev.currentLevelNumber + 1),
          levelsCompleted: prev.levelsCompleted + 1,
          totalMistakesAllTime: prev.totalMistakesAllTime + state.mistakes,
        }
        saveSave(profileId, next)
        return next
      })
    } else if (state.phase === 'lost') {
      setSave((prev) => {
        const next: SaveDataV1 = { ...prev, totalMistakesAllTime: prev.totalMistakesAllTime + state.mistakes }
        saveSave(profileId, next)
        return next
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  function goToNextLevel() {
    dispatch({ type: 'START_LEVEL', levelNumber: save.currentLevelNumber, seed: randomSeed() })
  }

  function retryLevel() {
    dispatch({ type: 'START_LEVEL', levelNumber: state.levelNumber, seed: randomSeed() })
  }

  const value: GameContextValue = { state, dispatch, save, goToNextLevel, retryLevel }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
