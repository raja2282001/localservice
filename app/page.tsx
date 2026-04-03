'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const AuthModal = lazy(() => import('@/components/auth/AuthModal'))

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  vendor_name: string
  rating?: {
    average: number
    total: number
  }
}

export default function Home() {
  const { user, logout } = useAuth()
  const { data: servicesData, isLoading, get } = useApi<any>()
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      await get('/api/services?limit=6')
    } catch (err) {
      console.error('Failed to load services')
    }
  }

  const services = servicesData?.services || []

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">ServiceHub</div>
            <nav className="flex items-center gap-6">
              <Link href="/about" className="text-sm hover:text-primary transition">
                About
              </Link>
              <Link href="/contact" className="text-sm hover:text-primary transition">
                Contact
              </Link>
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In / Register
              </Button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-balance text-foreground">
              Find Local Services, Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Connect with trusted service providers in your area. Book appointments,
              manage services, and pay securely.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Browse Services',
                description: 'Explore verified service providers and their offerings',
                icon: '🔍',
              },
              {
                title: 'Easy Booking',
                description: 'Schedule appointments with just a few clicks',
                icon: '📅',
              },
              {
                title: 'Secure Payments',
                description: 'Safe and encrypted transactions for peace of mind',
                icon: '💳',
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 bg-white hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowAuth(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mr-4"
            >
              Get Started
            </Button>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Featured Services for Guests */}
          {services.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold mb-8 text-center">Featured Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.slice(0, 3).map((service) => (
                  <Card key={service.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">${service.price}</span>
                      <span className="text-xs text-muted-foreground">{service.duration} mins</span>
                    </div>
                    {service.rating && (
                      <div className="text-sm text-yellow-500 mb-4">
                        ⭐ {service.rating.average.toFixed(1)} ({service.rating.total} reviews)
                      </div>
                    )}
                    <Button
                      onClick={() => setShowAuth(true)}
                      className="w-full bg-primary text-primary-foreground"
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-border mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ServiceHub</h3>
                <p className="text-sm text-muted-foreground">
                  Connecting you with trusted local service providers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <div className="space-y-2">
                  <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition">
                    About Us
                  </Link>
                  <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary transition">
                    Contact
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <div className="space-y-2">
                  <Link href="/services" className="block text-sm text-muted-foreground hover:text-primary transition">
                    Browse Services
                  </Link>
                  <span className="block text-sm text-muted-foreground">Become a Vendor</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <div className="space-y-2">
                  <span className="block text-sm text-muted-foreground">Help Center</span>
                  <span className="block text-sm text-muted-foreground">Privacy Policy</span>
                  <span className="block text-sm text-muted-foreground">Terms of Service</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 ServiceHub. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Auth Modal */}
        {showAuth && (
          <Suspense fallback={null}>
            <AuthModal
              onClose={() => setShowAuth(false)}
              onSuccess={() => {
                setShowAuth(false)
                window.location.href = '/dashboard'
              }}
            />
          </Suspense>
        )}
      </div>
    )
  }

  // Logged in view
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/services" className="text-sm hover:text-primary transition">
              Services
            </Link>
            <Link href="/about" className="text-sm hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-primary transition">
              Contact
            </Link>
            <Link
              href={user.role === 'customer' ? '/customer/dashboard' : '/vendor/dashboard'}
              className="text-sm hover:text-primary transition"
            >
              Dashboard
            </Link>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Explore our latest services</p>
        </div>

        {/* Featured Services */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : services.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-8">Featured Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="p-6 bg-white hover:shadow-lg transition-shadow h-full cursor-pointer">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">${service.price}</span>
                      <span className="text-xs text-muted-foreground">{service.duration} mins</span>
                    </div>
                    {service.rating && (
                      <div className="text-sm text-yellow-500 mb-4">
                        ⭐ {service.rating.average.toFixed(1)} ({service.rating.total} reviews)
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">By {service.vendor_name}</p>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/services">
                <Button size="lg" className="bg-primary text-primary-foreground">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No services available yet</p>
            <Link href="/services">
              <Button className="bg-primary text-primary-foreground">
                Browse All Services
              </Button>
            </Link>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ServiceHub</h3>
              <p className="text-sm text-muted-foreground">
                Connecting you with trusted local service providers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition">
                  About Us
                </Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary transition">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2">
                <Link href="/services" className="block text-sm text-muted-foreground hover:text-primary transition">
                  Browse Services
                </Link>
                <span className="block text-sm text-muted-foreground">Become a Vendor</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">Help Center</span>
                <span className="block text-sm text-muted-foreground">Privacy Policy</span>
                <span className="block text-sm text-muted-foreground">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ServiceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
