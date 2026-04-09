'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import VendorLayout from '@/components/layouts/VendorLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VendorServicesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingServices, get, put, delete: deleteService } = useApi<{ services: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'vendor') {
      get(`/api/services?vendorId=${user.id}`).catch(() => {})
    }
  }, [user, isLoading, router, get])

  const services = data?.services || []

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    try {
      await deleteService(`/api/services/${id}`)
      get(`/api/services?vendorId=${user?.id}`).catch(() => {})
    } catch {
      alert('Failed to delete service')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Services</h1>
            <p className="text-muted-foreground mt-2">
              Add, edit, or remove your service offerings.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingServices ? (
              <Card className="p-6 bg-white">Loading services...</Card>
            ) : services.length === 0 ? (
              <Card className="p-6 bg-white">No services found. Create one from your dashboard.</Card>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="p-6 bg-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm">Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>
                        Delete
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
