'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

export default function ContactPage() {
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate sending email - in real app, would call backend
      console.log('Contact form submitted:', formData)
      
      // Save to localStorage for demo
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      messages.push({
        ...formData,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('contact_messages', JSON.stringify(messages))

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error('Error submitting form:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <Link href="/about" className="text-sm hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="text-sm font-semibold text-primary">
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
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-white">
              <h3 className="text-lg font-bold mb-6">Get In Touch</h3>

              <div className="mb-8">
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-muted-foreground">support@servicehub.com</p>
              </div>

              <div className="mb-8">
                <h4 className="font-semibold mb-2">Phone</h4>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>

              <div className="mb-8">
                <h4 className="font-semibold mb-2">Address</h4>
                <p className="text-muted-foreground">
                  123 Service Street<br />
                  Tech City, TC 12345<br />
                  United States
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Hours</h4>
                <p className="text-muted-foreground">
                  Monday - Friday: 9am - 6pm<br />
                  Saturday: 10am - 4pm<br />
                  Sunday: Closed
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white">
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg text-green-700">
                  ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What is this about?"
                    required
                    className="bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please tell us more..."
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-3">How do I book a service?</h3>
              <p className="text-muted-foreground">
                Browse services, select one, fill in your details, choose a date and time, and confirm your booking.
              </p>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-3">What if I need to cancel?</h3>
              <p className="text-muted-foreground">
                You can cancel bookings from your dashboard. Cancellation policies vary by service provider.
              </p>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-3">How are ratings calculated?</h3>
              <p className="text-muted-foreground">
                Ratings are averages of all reviews left by customers who have used a specific service.
              </p>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold mb-3">Is my payment secure?</h3>
              <p className="text-muted-foreground">
                Yes, we use industry-standard encryption and security measures to protect your information.
              </p>
            </Card>
          </div>
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
