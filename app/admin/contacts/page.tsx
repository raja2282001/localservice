'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminContactsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingContacts, get } = useApi<{ contacts: Array<any> }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'admin') {
      get('/api/contacts').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const contacts = data?.contacts || []

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground mt-2">
              Review incoming customer messages and support requests.
            </p>
          </div>

          <div className="grid gap-4">
            {loadingContacts ? (
              <Card className="p-6 bg-white">Loading messages...</Card>
            ) : contacts.length === 0 ? (
              <Card className="p-6 bg-white">No contact messages yet.</Card>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-6 bg-white">
                  <div className="space-y-2">
                    <p className="font-semibold">{contact.subject || 'New message'}</p>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                    <p>{contact.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{contact.created_at}</span>
                      <Button size="sm" variant="outline">
                        Reply
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
