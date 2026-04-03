'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { RatingReview } from '@/components/RatingReview'

interface Review {
  id: string
  rating: number
  comment: string
  customer_name: string
  created_at: string
}

interface ServiceDetail {
  id: string
  name: string
  description: string
  price: number
  duration: number
  image_url?: string
  category_name: string
  vendor_name: string
  vendor_avatar?: string
  reviews: Review[]
  rating: {
    average: number
    total: number
  }
}

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string
  const { user } = useAuth()
  const { data: service, isLoading, get } = useApi<ServiceDetail>()
  const { post: postBooking } = useApi()
  const { post: postReview, isLoading: isReviewLoading } = useApi()
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadService()
  }, [serviceId])

  const loadService = async () => {
    try {
      await get(`/api/services/${serviceId}`)
    } catch (err) {
      console.error('Failed to load service')
    }
  }

  const handleBooking = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    setIsSubmitting(true)
    try {
      await postBooking('/api/bookings', {
        serviceId,
        bookingDate,
        notes: bookingNotes,
      })
      alert('Booking created successfully!')
      setBookingDate('')
      setBookingNotes('')
    } catch (err) {
      alert('Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      await postReview('/api/reviews', {
        serviceId,
        rating,
        comment,
      })
      // Reload service to get updated reviews
      setTimeout(() => loadService(), 500)
    } catch (err) {
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <Link href="/services">
            <Button variant="ghost">Services</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            {service.image_url && (
              <div className="h-96 rounded-lg overflow-hidden mb-8 bg-muted">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4">{service.name}</h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{service.rating.average}</span>
                <div className="text-sm text-muted-foreground">
                  ({service.rating.total} {service.rating.total === 1 ? 'review' : 'reviews'})
                </div>
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="text-muted-foreground">{service.category_name}</div>
              <div className="text-muted-foreground">•</div>
              <div className="text-muted-foreground">{service.duration} minutes</div>
            </div>

            <Card className="p-8 bg-white mb-8">
              <h2 className="text-xl font-semibold mb-4">About This Service</h2>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </Card>

            {/* Rating Form */}
            {user && user.role === 'customer' && (
              <div className="mb-8">
                <RatingReview
                  serviceId={serviceId}
                  onSubmit={handleRatingSubmit}
                  isSubmitting={isReviewLoading}
                />
              </div>
            )}

            {/* Reviews */}
            <Card className="p-8 bg-white">
              <h2 className="text-xl font-semibold mb-6">Reviews</h2>

              {service.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {service.reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-border last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{review.customer_name}</p>
                          <div className="flex gap-1 text-yellow-400">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-white sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-primary mb-2">${service.price}</div>
                <p className="text-sm text-muted-foreground">{service.vendor_name}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Booking Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bg-white"
                    required
                    disabled={!user}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special requirements?"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white"
                    rows={3}
                    disabled={!user}
                  />
                </div>
              </div>

              {user ? (
                <Button
                  onClick={handleBooking}
                  disabled={isSubmitting || !bookingDate}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-3"
                >
                  {isSubmitting ? 'Booking...' : 'Book Service'}
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-muted text-muted-foreground mb-3"
                >
                  Sign in to book
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
              >
                Add to Favorites
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
