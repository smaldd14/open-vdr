import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useUserProfile'
import { AppLayout } from './AppLayout'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <AppLayout>{children}</AppLayout>
}
