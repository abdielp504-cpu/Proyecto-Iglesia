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
import { ROLES } from './data/seedData'
import { useApp } from './context/AppContext'

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

function AppRoutes() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}><Route index element={<DashboardPage />} /><Route path="usuarios" element={<AdminOnly />} /><Route path="miembros" element={<MembersAccess />} /><Route path="ministerios" element={<MinistriesAccess />} /><Route path="eventos" element={<EventsAccess />} /><Route path="asistencia" element={<AttendanceAccess />} /><Route path="configuracion" element={<ConfigAccess />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider></React.StrictMode>)
