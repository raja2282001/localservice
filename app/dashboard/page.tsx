'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/')
      return
    }

    if (user.role === 'vendor') {
      router.replace('/vendor/dashboard')
    } else {
      router.replace('/customer/dashboard')
    }
  }, [user, router])

  return <div className="min-h-screen flex items-center justify-center">Redirecting to your dashboard...</div>
}
