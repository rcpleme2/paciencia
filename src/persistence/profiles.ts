export interface Profile {
  id: string
  name: string
  createdAt: number
}

const PROFILES_KEY = 'paciencia:profiles'
const ACTIVE_PROFILE_KEY = 'paciencia:activeProfileId'

export function listProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function createProfile(name: string): Profile {
  const profile: Profile = {
    id: `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    name: name.trim() || 'Jogador',
    createdAt: Date.now(),
  }
  saveProfiles([...listProfiles(), profile])
  return profile
}

export function deleteProfile(id: string): void {
  saveProfiles(listProfiles().filter((p) => p.id !== id))
  localStorage.removeItem(saveKeyForProfile(id))
  if (getActiveProfileId() === id) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  }
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY)
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id)
}

export function clearActiveProfile(): void {
  localStorage.removeItem(ACTIVE_PROFILE_KEY)
}

export function saveKeyForProfile(profileId: string): string {
  return `paciencia:save:${profileId}`
}
