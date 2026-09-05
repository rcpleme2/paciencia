import { saveKeyForProfile } from './profiles'
import { defaultSaveData, SAVE_VERSION, type SaveDataV1 } from './saveSchema'

export function loadSave(profileId: string): SaveDataV1 {
  try {
    const raw = localStorage.getItem(saveKeyForProfile(profileId))
    if (!raw) return defaultSaveData()
    const parsed = JSON.parse(raw)
    if (parsed.version !== SAVE_VERSION) return defaultSaveData()
    return parsed as SaveDataV1
  } catch {
    return defaultSaveData()
  }
}

export function saveSave(profileId: string, data: SaveDataV1): void {
  localStorage.setItem(saveKeyForProfile(profileId), JSON.stringify(data))
}
