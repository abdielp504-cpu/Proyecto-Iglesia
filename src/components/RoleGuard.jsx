import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  const location = useLocation()
  return currentUser ? children : <Navigate to="/login" replace state={{ from: location }} />
}

export function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { currentUser } = useApp()
  if (!currentUser || !allowedRoles.includes(currentUser.role)) return fallback
  return children
}
