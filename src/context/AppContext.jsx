import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedData, STORAGE_KEY, SESSION_KEY } from '../data/seedData'

const AppContext = createContext(null)

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return seedData
    const parsed = JSON.parse(stored)
    return {
      ...seedData,
      ...parsed,
      preferences: { ...seedData.preferences, ...(parsed.preferences || {}) },
    }
  } catch {
    return seedData
  }
}

function loadSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData)
  const [currentUser, setCurrentUser] = useState(loadSession)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser))
    else localStorage.removeItem(SESSION_KEY)
  }, [currentUser])

  useEffect(() => {
    const preferences = data.preferences || {}
    document.documentElement.dataset.accent = preferences.accent || 'ocean'
    document.documentElement.dataset.density = preferences.density || 'comfortable'
  }, [data.preferences])

  const login = (email, password) => {
    const user = data.users.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
    )
    if (!user) return { ok: false, error: 'El correo o la contraseña no son válidos.' }
    if (!user.active) return { ok: false, error: 'Esta cuenta está desactivada. Contacta al administrador.' }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    if (user.avatar) safeUser.avatar = user.avatar
    setCurrentUser(safeUser)
    return { ok: true, user: safeUser }
  }

  const logout = () => setCurrentUser(null)

  const updateCollection = (collection, value) => {
    setData((previous) => ({ ...previous, [collection]: value }))
  }

  const addCollectionItem = (collection, item, prefix) => {
    const newItem = { ...item, id: `${prefix}-${Date.now()}` }
    setData((previous) => ({ ...previous, [collection]: [...previous[collection], newItem] }))
    return newItem
  }

  const updateCollectionItem = (collection, id, changes) => {
    setData((previous) => ({
      ...previous,
      [collection]: previous[collection].map((item) => (item.id === id ? { ...item, ...changes } : item)),
    }))
  }

  const addEvent = (event) => addCollectionItem('events', event, 'evt')
  const updateEvent = (id, changes) => updateCollectionItem('events', id, changes)

  const addDonation = (donation) => addCollectionItem('donations', donation, 'don')
  const updateDonation = (id, changes) => updateCollectionItem('donations', id, changes)
  const addAnnouncement = (announcement) => addCollectionItem('announcements', announcement, 'ann')
  const updateAnnouncement = (id, changes) => updateCollectionItem('announcements', id, changes)
  const removeAnnouncement = (id) => {
    setData((previous) => ({
      ...previous,
      announcements: previous.announcements.filter((announcement) => announcement.id !== id),
    }))
  }

  const saveAttendance = (eventId, date, records) => {
    setData((previous) => {
      const existing = previous.attendance.find((item) => item.eventId === eventId && item.date === date)
      const next = { id: existing?.id || `att-${Date.now()}`, eventId, date, records, savedAt: new Date().toISOString() }
      return {
        ...previous,
        attendance: existing
          ? previous.attendance.map((item) => (item.id === existing.id ? next : item))
          : [...previous.attendance, next],
      }
    })
  }

  const addMember = (member) => addCollectionItem('members', member, 'mbr')
  const updateMember = (id, changes) => updateCollectionItem('members', id, changes)
  const toggleMemberStatus = (id) => {
    setData((previous) => ({
      ...previous,
      members: previous.members.map((member) => (
        member.id === id
          ? { ...member, status: member.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' }
          : member
      )),
    }))
  }

  const addMinistry = (ministry) => addCollectionItem('ministries', ministry, 'min')
  const updateMinistry = (id, changes) => updateCollectionItem('ministries', id, changes)
  const toggleMinistryMember = (ministryId, memberId) => {
    setData((previous) => ({
      ...previous,
      ministries: previous.ministries.map((ministry) => {
        if (ministry.id !== ministryId) return ministry
        const memberIds = ministry.memberIds.includes(memberId)
          ? ministry.memberIds.filter((id) => id !== memberId)
          : [...ministry.memberIds, memberId]
        return { ...ministry, memberIds }
      }),
    }))
  }

  const updateChurchConfig = (changes) => {
    setData((previous) => ({ ...previous, churchConfig: { ...previous.churchConfig, ...changes } }))
  }

  const updatePreferences = (changes) => {
    setData((previous) => ({ ...previous, preferences: { ...previous.preferences, ...changes } }))
  }

  const addUser = (user) => {
    const newUser = { ...user, id: `usr-${Date.now()}`, active: true }
    setData((previous) => ({ ...previous, users: [...previous.users, newUser] }))
  }

  const updateUser = (id, changes) => {
    setData((previous) => ({
      ...previous,
      users: previous.users.map((user) => (user.id === id ? { ...user, ...changes } : user)),
    }))
  }

  const updateProfile = ({ name, email, avatar, currentPassword, newPassword }) => {
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const user = data.users.find((candidate) => candidate.id === currentUser?.id)
    if (!user) return { ok: false, error: 'No se encontró la cuenta activa.' }
    if (!trimmedName || !normalizedEmail) return { ok: false, error: 'El nombre y el correo son obligatorios.' }
    if (data.users.some((candidate) => candidate.id !== user.id && candidate.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'Ese correo ya está asociado a otra cuenta.' }
    }
    if (newPassword && (newPassword.length < 8 || currentPassword !== user.password)) {
      return { ok: false, error: currentPassword !== user.password ? 'La contraseña actual no es correcta.' : 'La nueva contraseña debe tener al menos 8 caracteres.' }
    }
    const changes = { name: trimmedName, email: normalizedEmail, avatar: avatar || '' }
    if (newPassword) changes.password = newPassword
    updateUser(user.id, changes)
    const nextSession = { ...currentUser, name: trimmedName, email: normalizedEmail, avatar: avatar || '' }
    setCurrentUser(nextSession)
    return { ok: true }
  }

  const value = useMemo(
    () => ({
      ...data,
      currentUser,
      login,
      logout,
      updateChurchConfig,
      updatePreferences,
      addUser,
      updateUser,
      updateProfile,
      updateCollection,
      addMember,
      updateMember,
      toggleMemberStatus,
      addMinistry,
      updateMinistry,
      toggleMinistryMember,
      addEvent,
      updateEvent,
      saveAttendance,
      addDonation,
      updateDonation,
      addAnnouncement,
      updateAnnouncement,
      removeAnnouncement,
    }),
    [data, currentUser],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}
