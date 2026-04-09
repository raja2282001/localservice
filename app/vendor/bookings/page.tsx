'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import VendorLayout from '@/components/layouts/VendorLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VendorBookingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingBookings, get, put } = useApi<{ bookings: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'vendor') {
      get('/api/bookings?vendor=true').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const bookings = data?.bookings || []

  const handleStatus = async (id: string, status: 'accepted' | 'cancelled' | 'completed') => {
    try {
      await put(`/api/bookings/${id}`, { status })
      get('/api/bookings?vendor=true').catch(() => {})
    } catch {
      alert('Failed to update booking status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Booking Requests</h1>
            <p className="text-muted-foreground mt-2">
              Accept or reject incoming customer bookings.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingBookings ? (
              <Card className="p-6 bg-white">Loading booking requests...</Card>
            ) : bookings.length === 0 ? (
              <Card className="p-6 bg-white">No booking requests yet.</Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-6 bg-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{booking.service_name}</p>
                      <p className="text-sm text-muted-foreground">Booked by {booking.customer_name}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-flow-col">
                      <Button size="sm" onClick={() => handleStatus(booking.id, 'accepted')}>
                        Accept
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatus(booking.id, 'cancelled')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
