'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface VendorStats {
  services: number
  bookings: {
    total: number
    completed: number
    pending: number
    cancelled: number
  }
  rating: {
    average: number
    total_reviews: number
  }
  revenue: {
    total: number
  }
}

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string
  is_active: boolean
}

interface Booking {
  id: string
  service_name: string
  customer_name: string
  booking_date: string
  status: string
  created_at: string
}

export default function VendorDashboard() {
  const router = useRouter()
  const { user, logout: authLogout, isLoading } = useAuth()
  const { data: stats, get: getStats } = useApi<VendorStats>()
  const { data: servicesData, get: getServices } = useApi<Service[]>()
  const { data: bookingsData, get: getBookings } = useApi<Booking[]>()
  const { post, put } = useApi()
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'bookings'>('overview')
  const [showNewService, setShowNewService] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    categoryId: '',
  })

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) {
      return
    }

    if (!user) {
      router.replace('/')
      return
    }

    if (user.role !== 'vendor') {
      router.replace('/')
      return
    }

    loadData()
  }, [user, isLoading, router])

  const handleLogout = () => {
    authLogout()
    router.replace('/')
  }

  const loadData = async () => {
    if (!user) return

    try {
      await getStats('/api/vendors/stats')
      await getServices(`/api/services?vendorId=${user.id}`)
      await getBookings('/api/bookings')
    } catch (err) {
      console.error('Failed to load data')
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await post('/api/services', {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        categoryId: formData.categoryId,
      })

      alert('Service added successfully!')
      setFormData({ name: '', description: '', price: '', duration: '', categoryId: '' })
      setShowNewService(false)
      loadData()
    } catch (err) {
      alert('Failed to add service')
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      categoryId: '1', // Default category, could be improved
    })
    setShowNewService(true)
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingService) return

    try {
      await put(`/api/services/${editingService.id}`, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      })

      alert('Service updated successfully!')
      setFormData({ name: '', description: '', price: '', duration: '', categoryId: '' })
      setShowNewService(false)
      setEditingService(null)
      loadData()
    } catch (err) {
      alert('Failed to update service')
    }
  }

  const handleToggleServiceStatus = async (service: Service) => {
    try {
      await put(`/api/services/${service.id}`, {
        is_active: !service.is_active,
      })

      alert(`Service ${!service.is_active ? 'activated' : 'deactivated'} successfully!`)
      loadData()
    } catch (err) {
      alert('Failed to update service status')
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await put(`/api/bookings/${bookingId}`, {
        status: 'accepted',
      })

      alert('Booking accepted successfully!')
      loadData()
    } catch (err) {
      alert('Failed to accept booking')
    }
  }

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await put(`/api/bookings/${bookingId}`, {
        status: 'cancelled',
      })

      alert('Booking declined successfully!')
      loadData()
    } catch (err) {
      alert('Failed to decline booking')
    }
  }

  const services: Service[] = (servicesData as any)?.services || []
  const bookings = bookingsData || []

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
          <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'services'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'bookings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-white">
                <p className="text-muted-foreground text-sm mb-2">Total Services</p>
                <p className="text-3xl font-bold text-primary">{stats.services}</p>
              </Card>

              <Card className="p-6 bg-white">
                <p className="text-muted-foreground text-sm mb-2">Total Bookings</p>
                <p className="text-3xl font-bold text-primary">{stats.bookings.total}</p>
              </Card>

              <Card className="p-6 bg-white">
                <p className="text-muted-foreground text-sm mb-2">Average Rating</p>
                <p className="text-3xl font-bold text-primary">{stats.rating.average}</p>
                <p className="text-sm text-muted-foreground">({stats.rating.total_reviews} reviews)</p>
              </Card>

              <Card className="p-6 bg-white">
                <p className="text-muted-foreground text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">${stats.revenue.total}</p>
              </Card>
            </div>

            <Card className="p-8 bg-white">
              <h2 className="text-xl font-bold mb-4">Booking Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded">
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-bold">{stats.bookings.pending}</p>
                </div>
                <div className="p-4 bg-accent/20 rounded">
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.bookings.completed}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded">
                  <p className="text-muted-foreground text-sm">Cancelled</p>
                  <p className="text-2xl font-bold">{stats.bookings.cancelled}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded">
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.bookings.total}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Services</h2>
              <Button
                onClick={() => {
                  if (showNewService) {
                    setShowNewService(false)
                    setEditingService(null)
                    setFormData({ name: '', description: '', price: '', duration: '', categoryId: '' })
                  } else {
                    setShowNewService(true)
                  }
                }}
                className="bg-primary text-primary-foreground"
              >
                {showNewService ? 'Cancel' : 'Add Service'}
              </Button>
            </div>

            {showNewService && (
              <Card className="p-8 bg-white mb-8">
                <h3 className="text-lg font-bold mb-6">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., House Cleaning"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your service..."
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="99.99"
                        required
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="60"
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md bg-white"
                    >
                      <option value="">Select a category</option>
                      <option value="1">Cleaning</option>
                      <option value="2">Repair</option>
                      <option value="3">Tutoring</option>
                      <option value="4">Fitness</option>
                      <option value="5">Other</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground">
                    Add Service
                  </Button>
                </form>
              </Card>
            )}

            {services.length === 0 ? (
              <Card className="p-8 bg-white text-center">
                <p className="text-muted-foreground mb-4">No services yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-6 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{service.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-primary font-semibold">${service.price}</span>
                          <span className="text-muted-foreground">{service.duration} mins</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            service.is_active
                              ? 'bg-accent/20 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleServiceStatus(service)}
                        >
                          {service.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>

            {bookings.length === 0 ? (
              <Card className="p-8 bg-white text-center">
                <p className="text-muted-foreground">No bookings yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                        <p className="text-muted-foreground">{booking.customer_name}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span>{new Date(booking.booking_date).toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === 'pending'
                              ? 'bg-accent/20 text-accent'
                              : booking.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcceptBooking(booking.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeclineBooking(booking.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
