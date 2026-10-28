import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { AppProvider } from './context/AppContext'
import { ProtectedRoute, RoleGuard } from './components/RoleGuard'
import MainLayout from './components/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import ChurchConfigPage from './pages/ChurchConfigPage'
import Members from './pages/Members'
import Ministries from './pages/Ministries'
import Events from './pages/Events'
import Attendance from './pages/Attendance'
import Donations from './pages/Donations'
import Announcements from './pages/Announcements'
import { ROLES } from './data/seedData'
import { useApp } from './context/AppContext'
import { Alert } from './components/ui'

function AdminOnly() {
  const { currentUser } = useApp()
  return <RoleGuard allowedRoles={[ROLES.ADMINISTRADOR]} fallback={<Navigate to="/" replace />}><UsersPage /></RoleGuard>
}

function ConfigAccess() {
  const { currentUser } = useApp()
  return <RoleGuard allowedRoles={[ROLES.ADMINISTRADOR, ROLES.PASTOR]} fallback={<Navigate to="/" replace />}><ChurchConfigPage /></RoleGuard>
}

function MembersAccess() {
  return <RoleGuard allowedRoles={Object.values(ROLES)}><Members /></RoleGuard>
}

function MinistriesAccess() {
  return <RoleGuard allowedRoles={Object.values(ROLES)}><Ministries /></RoleGuard>
}

function EventsAccess() {
  return <RoleGuard allowedRoles={Object.values(ROLES)}><Events /></RoleGuard>
}

function AttendanceAccess() {
  return <RoleGuard allowedRoles={[ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.SECRETARIO, ROLES.COORDINADOR]}><Attendance /></RoleGuard>
}

function RestrictedAccess() {
  return <div className="mx-auto max-w-2xl"><div className="rounded-2xl border border-rose-200 bg-white p-8 shadow-soft"><Alert>Acceso restringido: tu rol no tiene permisos para consultar este módulo.</Alert><p className="mt-4 text-sm leading-6 text-slate-500">Si necesitas acceso, solicita al administrador que actualice tus permisos.</p></div></div>
}

function DonationsAccess() {
  const { currentUser } = useApp()
  const allowed = [ROLES.ADMINISTRADOR, ROLES.PASTOR, ROLES.TESORERO]
  return allowed.includes(currentUser.role) ? <Donations /> : <RestrictedAccess />
}

function AnnouncementsAccess() {
  return <Announcements />
}

function AppRoutes() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}><Route index element={<DashboardPage />} /><Route path="usuarios" element={<AdminOnly />} /><Route path="miembros" element={<MembersAccess />} /><Route path="ministerios" element={<MinistriesAccess />} /><Route path="eventos" element={<EventsAccess />} /><Route path="asistencia" element={<AttendanceAccess />} /><Route path="donaciones" element={<DonationsAccess />} /><Route path="comunicados" element={<AnnouncementsAccess />} /><Route path="configuracion" element={<ConfigAccess />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider></React.StrictMode>)
