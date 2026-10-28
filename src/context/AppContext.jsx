import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedData, STORAGE_KEY, SESSION_KEY } from '../data/seedData'

const AppContext = createContext(null)

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...seedData, ...JSON.parse(stored) } : seedData
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

  const login = (email, password) => {
    const user = data.users.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
    )
    if (!user) return { ok: false, error: 'El correo o la contraseña no son válidos.' }
    if (!user.active) return { ok: false, error: 'Esta cuenta está desactivada. Contacta al administrador.' }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    setCurrentUser(safeUser)
    return { ok: true, user: safeUser }
  }

  const logout = () => setCurrentUser(null)

  const updateCollection = (collection, value) => {
    setData((previous) => ({ ...previous, [collection]: value }))
  }

  const updateChurchConfig = (changes) => {
    setData((previous) => ({ ...previous, churchConfig: { ...previous.churchConfig, ...changes } }))
  }

  const addUser = (user) => {
    const newUser = { ...user, id: `usr-${Date.now()}`, active: true }
    updateCollection('users', [...data.users, newUser])
  }

  const updateUser = (id, changes) => {
    updateCollection('users', data.users.map((user) => (user.id === id ? { ...user, ...changes } : user)))
  }

  const value = useMemo(
    () => ({ ...data, currentUser, login, logout, updateChurchConfig, addUser, updateUser, updateCollection }),
    [data, currentUser],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppProvider')
  return context
}
