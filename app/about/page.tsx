'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function AboutPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition">
              Home
            </Link>
            <Link href="/about" className="text-sm font-semibold text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm hover:text-primary transition">
              Contact
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-sm hover:text-primary transition">
                  Dashboard
                </Link>
                <Button onClick={logout} variant="outline" size="sm">
                  Sign Out
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-6">About ServiceHub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            ServiceHub is a professional platform connecting customers with trusted service providers.
            We make it easy to book, manage, and review local services.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe that finding and booking quality services should be simple, transparent, and trustworthy.
              Our mission is to bridge the gap between service providers and customers by creating a platform that
              prioritizes reliability, quality, and customer satisfaction.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you need cleaning, repairs, tutoring, or fitness services, ServiceHub is your go-to marketplace
              for professional service providers in your area.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-semibold">Professional Services, Simplified</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10">Why Choose ServiceHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-3">Verified Providers</h3>
              <p className="text-muted-foreground">
                All service providers are verified and reviewed by our community to ensure quality and reliability.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-3">Ratings & Reviews</h3>
              <p className="text-muted-foreground">
                Real customer reviews and ratings help you make informed decisions about which service to book.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Your information is protected with industry-standard security, and transactions are quick and easy.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-muted-foreground">
                Book services in just a few clicks. Choose your time, confirm, and you're all set!
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3">Support</h3>
              <p className="text-muted-foreground">
                Our dedicated support team is here to help with any questions or issues you may have.
              </p>
            </Card>

            <Card className="p-8 bg-white">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
              <p className="text-muted-foreground">
                Transparent pricing with no hidden fees. You know exactly what you're paying for.
              </p>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary/10 rounded-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">By The Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Service Providers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <p className="text-muted-foreground">Bookings Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of customers and service providers using ServiceHub to find and book quality services.
          </p>
          <Link href="/services">
            <Button size="lg" className="bg-primary text-primary-foreground">
              Browse Services
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; 2026 ServiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
