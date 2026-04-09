'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingUsers, get } = useApi<{ users: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'admin') {
      get('/api/users').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const users = data?.users || []

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-muted-foreground mt-2">
              Review account roles and keep the platform secure.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingUsers ? (
              <Card className="p-6 bg-white">Loading users...</Card>
            ) : users.length === 0 ? (
              <Card className="p-6 bg-white">No users available.</Card>
            ) : (
              users.map((userItem) => (
                <Card key={userItem.id} className="p-6 bg-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{userItem.name}</p>
                    <p className="text-sm text-muted-foreground">{userItem.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{userItem.role}</div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
