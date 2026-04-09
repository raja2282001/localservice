'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingBookings, get } = useApi<{ bookings: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'admin') {
      get('/api/bookings').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const bookings = data?.bookings || []

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground mt-2">
              See every reservation across the platform.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingBookings ? (
              <Card className="p-6 bg-white">Loading bookings...</Card>
            ) : bookings.length === 0 ? (
              <Card className="p-6 bg-white">No booking records yet.</Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-6 bg-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{booking.service_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{booking.status}</span>
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
