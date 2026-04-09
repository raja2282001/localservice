'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [user, isLoading, router])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Review users, services, bookings and contact messages from one place.
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {[
              { label: 'Users', value: 'Manage roles & accounts' },
              { label: 'Services', value: 'Approve or remove offerings' },
              { label: 'Bookings', value: 'Track all reservations' },
              { label: 'Contacts', value: 'Read incoming messages' },
            ].map((card) => (
              <Card key={card.label} className="p-6 bg-white">
                <p className="text-sm uppercase tracking-[.2em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-4 text-lg font-semibold">{card.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
