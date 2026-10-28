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

function AppRoutes() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}><Route index element={<DashboardPage />} /><Route path="usuarios" element={<AdminOnly />} /><Route path="configuracion" element={<ConfigAccess />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AppProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppProvider></React.StrictMode>)
