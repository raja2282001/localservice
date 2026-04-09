'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-border bg-white p-6">
          <div className="mb-10">
            <Link href="/admin/dashboard" className="text-2xl font-bold text-primary">
              Admin Panel
            </Link>
          </div>
          <nav className="space-y-3 text-sm text-slate-700">
            <Link
              href="/admin/dashboard"
              className="block rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary"
            >
              Users
            </Link>
            <Link
              href="/admin/services"
              className="block rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary"
            >
              Services
            </Link>
            <Link
              href="/admin/bookings"
              className="block rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary"
            >
              Bookings
            </Link>
            <Link
              href="/admin/contacts"
              className="block rounded-md px-3 py-2 hover:bg-primary/10 hover:text-primary"
            >
              Contacts
            </Link>
          </nav>

          <div className="mt-10 border-t border-border pt-6 text-sm text-slate-600">
            <p className="mb-3">Signed in as</p>
            <p className="font-semibold">{user?.name || 'Admin'}</p>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </aside>

        <section className="flex-1 p-8">{children}</section>
      </div>
    </div>
  )
}
