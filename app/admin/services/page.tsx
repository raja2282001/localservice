'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminServicesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingServices, get } = useApi<{ services: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'admin') {
      get('/api/services').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const services = data?.services || []

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Services</h1>
            <p className="text-muted-foreground mt-2">
              Moderate vendor offerings and approve new listings.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingServices ? (
              <Card className="p-6 bg-white">Loading services...</Card>
            ) : services.length === 0 ? (
              <Card className="p-6 bg-white">No services available.</Card>
            ) : (
              services.map((service) => (
                <Card key={service.id} className="p-6 bg-white">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                        ${service.price}
                      </span>
                      <Button size="sm" variant="outline">
                        Review
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
