'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CustomerBookingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingBookings, get, put } = useApi<{ bookings: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'customer') {
      get('/api/bookings').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const bookings = data?.bookings || []

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await put(`/api/bookings/${id}`, { status: 'cancelled' })
      get('/api/bookings').catch(() => {})
    } catch {
      alert('Could not cancel booking')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <CustomerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-2">
              View upcoming reservations and manage your scheduled services.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingBookings ? (
              <Card className="p-6 bg-white">Loading bookings...</Card>
            ) : bookings.length === 0 ? (
              <Card className="p-6 bg-white">No bookings found. Browse services to book something new.</Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-6 bg-white">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{booking.service_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.vendor_name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.booking_date).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        {booking.status}
                      </span>
                      {booking.status === 'pending' && (
                        <Button size="sm" variant="destructive" onClick={() => cancelBooking(booking.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </CustomerLayout>
    </ProtectedRoute>
  )
}
