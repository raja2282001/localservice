'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

interface CustomerLayoutProps {
  children: React.ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/" className="hover:text-primary transition">
              Home
            </Link>
            <Link href="/services" className="hover:text-primary transition">
              Services
            </Link>
            <Link href="/customer/bookings" className="hover:text-primary transition">
              My Bookings
            </Link>
            <Link href="/about" className="hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary transition">
              Contact
            </Link>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Sign Out
              </Button>
            ) : (
              <Link href="/" className="rounded-md border border-input px-4 py-2 text-sm hover:border-primary">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
