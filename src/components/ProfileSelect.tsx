import { useState, type MouseEvent } from 'react'
import { createProfile, deleteProfile, listProfiles, setActiveProfileId, type Profile } from '../persistence/profiles'
import { loadSave } from '../persistence/storage'

export function ProfileSelect({ onSelect }: { onSelect: (profileId: string) => void }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => listProfiles())
  const [newName, setNewName] = useState('')

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    const profile = createProfile(name)
    setProfiles(listProfiles())
    setNewName('')
    setActiveProfileId(profile.id)
    onSelect(profile.id)
  }

  function handleDelete(id: string, e: MouseEvent) {
    e.stopPropagation()
    deleteProfile(id)
    setProfiles(listProfiles())
  }

  return (
    <div className="profile-select">
      <h1>Paciência de Associações</h1>
      <p className="profile-select__subtitle">Quem está jogando?</p>

      <ul className="profile-list">
        {profiles.map((p) => {
          const save = loadSave(p.id)
          return (
            <li key={p.id}>
              <button
                className="profile-list__item"
                onClick={() => {
                  setActiveProfileId(p.id)
                  onSelect(p.id)
                }}
              >
                <span className="profile-list__name">{p.name}</span>
                <span className="profile-list__progress">Nível {save.currentLevelNumber}</span>
                <span className="profile-list__delete" onClick={(e) => handleDelete(p.id, e)} title="Remover perfil">
                  ✕
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="profile-create">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Novo perfil"
          maxLength={24}
        />
        <button onClick={handleCreate}>Criar perfil</button>
      </div>
    </div>
  )
}
