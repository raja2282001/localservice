'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Booking {
  id: string
  service_id: string
  booking_date: string
  status: string
  notes?: string
  service_name: string
  vendor_name: string
  service_price: number
}

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, logout: authLogout, isLoading } = useAuth()
  const { data: bookingsData, isLoading: apiLoading, get } = useApi<Booking[]>()
  const { put } = useApi()
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings')

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) {
      return
    }

    if (!user) {
      router.replace('/')
      return
    }

    if (user.role !== 'customer') {
      router.replace('/')
      return
    }

    loadBookings()
  }, [user, isLoading, router])

  const handleLogout = () => {
    authLogout()
    router.replace('/')
  }

  const loadBookings = async () => {
    try {
      await get('/api/bookings')
    } catch (err) {
      console.error('Failed to load bookings')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await put(`/api/bookings/${bookingId}`, { status: 'cancelled' })
      loadBookings()
    } catch (err) {
      alert('Failed to cancel booking')
    }
  }

  const bookings = bookingsData || []
  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && new Date(b.booking_date) > new Date()
  )
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.booking_date) <= new Date()
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Dashboard Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your bookings and profile</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'bookings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Upcoming Bookings</h2>

              {apiLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <Card className="p-8 bg-white text-center">
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <Link href="/services">
                    <Button className="bg-primary text-primary-foreground">
                      Browse Services
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                          <p className="text-muted-foreground">{booking.vendor_name}</p>
                        </div>
                        <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {new Date(booking.booking_date).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium text-primary">${booking.service_price}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-muted/50 rounded text-sm">
                          <p className="text-muted-foreground">Notes: {booking.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/services/${booking.service_id}`}>
                          <Button variant="outline" size="sm">
                            View Service
                          </Button>
                        </Link>
                        {booking.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Past Bookings</h2>
                <div className="grid gap-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="p-6 bg-white opacity-75">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                          <p className="text-muted-foreground">{booking.vendor_name}</p>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/services/${booking.service_id}`}>
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <Card className="p-8 bg-white max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <p className="text-foreground">{user?.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <p className="text-foreground">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Type</label>
                  <p className="text-foreground capitalize">{user?.role}</p>
                </div>

                <div className="pt-4">
                  <Button variant="outline">Edit Profile</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
