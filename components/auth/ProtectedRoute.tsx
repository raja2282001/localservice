'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: Array<'customer' | 'vendor' | 'admin'>
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace(fallbackPath)
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(fallbackPath)
    }
  }, [user, isLoading, allowedRoles, router, fallbackPath])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-medium">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
