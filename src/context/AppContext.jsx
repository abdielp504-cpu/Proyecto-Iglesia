import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedData, STORAGE_KEY, SESSION_KEY } from '../data/seedData'
import { supabase } from '../supabaseClient'

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

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const [
          membersRes,
          eventsRes,
          donationsRes,
          announcementsRes,
          attendanceRes,
          ministriesRes,
          usersRes
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('events').select('*'),
          supabase.from('donations').select('*'),
          supabase.from('announcements').select('*'),
          supabase.from('attendance').select('*'),
          supabase.from('ministries').select('*'),
          supabase.from('users').select('*'),
        ])

        setData((previous) => ({
          ...previous,
          members: membersRes.data?.length ? membersRes.data : previous.members,
          events: eventsRes.data?.length ? eventsRes.data : previous.events,
          donations: donationsRes.data?.length ? donationsRes.data : previous.donations,
          announcements: announcementsRes.data?.length ? announcementsRes.data : previous.announcements,
          attendance: attendanceRes.data?.length ? attendanceRes.data : previous.attendance,
          ministries: ministriesRes.data?.length ? ministriesRes.data : previous.ministries,
          users: usersRes.data?.length ? usersRes.data : previous.users,
        }))
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err)
      }
    }
    fetchSupabaseData()
  }, [])

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

  const addCollectionItem = async (collection, item, prefix) => {
    const newItem = { ...item, id: `${prefix}-${Date.now()}` }
    setData((previous) => ({ ...previous, [collection]: [...previous[collection], newItem] }))
    
    // Guardar en Supabase
    try {
      await supabase.from(collection).insert([newItem])
    } catch (err) {
      console.error(`Error guardando en Supabase (${collection}):`, err)
    }
    return newItem
  }

  const updateCollectionItem = async (collection, id, changes) => {
    setData((previous) => ({
      ...previous,
      [collection]: previous[collection].map((item) => (item.id === id ? { ...item, ...changes } : item)),
    }))

    // Actualizar en Supabase
    try {
      await supabase.from(collection).update(changes).eq('id', id)
    } catch (err) {
      console.error(`Error actualizando en Supabase (${collection}):`, err)
    }
  }

  const addEvent = (event) => addCollectionItem('events', event, 'evt')
  const updateEvent = (id, changes) => updateCollectionItem('events', id, changes)

  const addDonation = (donation) => addCollectionItem('donations', donation, 'don')
  const updateDonation = (id, changes) => updateCollectionItem('donations', id, changes)
  
  const addAnnouncement = (announcement) => addCollectionItem('announcements', announcement, 'ann')
  const updateAnnouncement = (id, changes) => updateCollectionItem('announcements', id, changes)
  
  const removeAnnouncement = async (id) => {
    setData((previous) => ({
      ...previous,
      announcements: previous.announcements.filter((announcement) => announcement.id !== id),
    }))
    try {
      await supabase.from('announcements').delete().eq('id', id)
    } catch (err) {
      console.error('Error eliminando en Supabase (announcements):', err)
    }
  }

  const saveAttendance = async (eventId, date, records) => {
    let targetId = null
    setData((previous) => {
      const existing = previous.attendance.find((item) => item.eventId === eventId && item.date === date)
      targetId = existing?.id || `att-${Date.now()}`
      const next = { id: targetId, eventId, date, records, savedAt: new Date().toISOString() }
      return {
        ...previous,
        attendance: existing
          ? previous.attendance.map((item) => (item.id === existing.id ? next : item))
          : [...previous.attendance, next],
      }
    })
    try {
      await supabase.from('attendance').upsert({ id: targetId, eventId, date, records, savedAt: new Date().toISOString() })
    } catch (err) {
      console.error('Error guardando asistencia en Supabase:', err)
    }
  }

  const addMember = (member) => addCollectionItem('members', member, 'mbr')
  const updateMember = (id, changes) => updateCollectionItem('members', id, changes)
  const toggleMemberStatus = async (id) => {
    let newStatus = 'ACTIVO'
    setData((previous) => ({
      ...previous,
      members: previous.members.map((member) => {
        if (member.id === id) {
          newStatus = member.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
          return { ...member, status: newStatus }
        }
        return member
      }),
    }))
    try {
      await supabase.from('members').update({ status: newStatus }).eq('id', id)
    } catch (err) {
      console.error('Error actualizando estado de miembro en Supabase:', err)
    }
  }

  const addMinistry = (ministry) => addCollectionItem('ministries', ministry, 'min')
  const updateMinistry = (id, changes) => updateCollectionItem('ministries', id, changes)
  const toggleMinistryMember = async (ministryId, memberId) => {
    let updatedMemberIds = []
    setData((previous) => ({
      ...previous,
      ministries: previous.ministries.map((ministry) => {
        if (ministry.id !== ministryId) return ministry
        updatedMemberIds = ministry.memberIds.includes(memberId)
          ? ministry.memberIds.filter((id) => id !== memberId)
          : [...ministry.memberIds, memberId]
        return { ...ministry, memberIds: updatedMemberIds }
      }),
    }))
    try {
      await supabase.from('ministries').update({ memberIds: updatedMemberIds }).eq('id', ministryId)
    } catch (err) {
      console.error('Error actualizando ministerio en Supabase:', err)
    }
  }

  const updateChurchConfig = async (changes) => {
    setData((previous) => ({ ...previous, churchConfig: { ...previous.churchConfig, ...changes } }))
    try {
      await supabase.from('church_config').upsert({ id: 1, ...changes })
    } catch (err) {
      console.error('Error actualizando configuración en Supabase:', err)
    }
  }

  const addUser = (user) => {
    const newUser = { ...user, id: `usr-${Date.now()}`, active: true }
    addCollectionItem('users', newUser, 'usr')
  }

  const updateUser = (id, changes) => updateCollectionItem('users', id, changes)

  const value = useMemo(
    () => ({
      ...data,
      currentUser,
      login,
      logout,
      updateChurchConfig,
      addUser,
      updateUser,
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
