export const SAVE_VERSION = 1

export interface SaveDataV1 {
  version: 1
  currentLevelNumber: number
  highestLevelReached: number
  totalMistakesAllTime: number
  levelsCompleted: number
  settings: {
    soundOn: boolean
    reducedMotion: boolean
  }
}

export type AnySaveData = SaveDataV1

export function defaultSaveData(): SaveDataV1 {
  return {
    version: SAVE_VERSION,
    currentLevelNumber: 1,
    highestLevelReached: 1,
    totalMistakesAllTime: 0,
    levelsCompleted: 0,
    settings: { soundOn: true, reducedMotion: false },
  }
}
