import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'
import { validateRating, validateDescription } from '@/lib/validators'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const reviewsCollection = db.collection('reviews')
    const usersCollection = db.collection('users')

    const reviews = await reviewsCollection
      .find({ service_id: serviceId })
      .sort({ created_at: -1 })
      .toArray()

    // Enrich with customer info
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const customer = await usersCollection.findOne({ _id: new ObjectId(review.customer_id) })
        return {
          ...review,
          id: review._id.toString(),
          customer_name: customer?.full_name || 'Anonymous',
          customer_email: customer?.email || '',
        }
      })
    )

    return NextResponse.json(enrichedReviews)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can create reviews' }, { status: 403 })
    }

    const body = await req.json()
    const { serviceId, bookingId, rating, comment } = body

    // Validation
    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    if (!rating || !validateRating(rating)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (comment && !validateDescription(comment)) {
      return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const reviewsCollection = db.collection('reviews')

    // Check if already reviewed
    const existing = await reviewsCollection.findOne({
      service_id: serviceId,
      customer_id: user.id,
      booking_id: bookingId,
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this service' }, { status: 409 })
    }

    // Create review
    const result = await reviewsCollection.insertOne({
      service_id: serviceId,
      booking_id: bookingId || null,
      customer_id: user.id,
      rating,
      comment: comment || null,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const created = await reviewsCollection.findOne({ _id: result.insertedId })

    return NextResponse.json(
      {
        ...created,
        id: created?._id.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}
