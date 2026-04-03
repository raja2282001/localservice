import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Only vendors can access this' }, { status: 403 })
    }

    const db = await connectToDatabase()
    const services = db.collection('services')
    const bookings = db.collection('bookings')
    const reviews = db.collection('reviews')

    const serviceCount = await services.countDocuments({ vendor_id: user.id, is_active: true })

    const bookingAggregation = await bookings
      .aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'service_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        { $match: { 'service.vendor_id': user.id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    const bookingStats = bookingAggregation[0] || { total: 0, completed: 0, pending: 0, cancelled: 0 }

    const ratingAggregation = await reviews
      .aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'service_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        { $match: { 'service.vendor_id': user.id } },
        {
          $group: {
            _id: null,
            average_rating: { $avg: '$rating' },
            total_reviews: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const ratingStats = ratingAggregation[0] || { average_rating: 0, total_reviews: 0 }

    const revenueAggregation = await bookings
      .aggregate([
        {
          $lookup: {
            from: 'services',
            localField: 'service_id',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        { $match: { 'service.vendor_id': user.id, status: 'completed' } },
        { $group: { _id: null, total_revenue: { $sum: '$service.price' } } },
      ])
      .toArray()

    const revenueValue = revenueAggregation[0]?.total_revenue || 0

    return NextResponse.json({
      services: serviceCount,
      bookings: {
        total: bookingStats.total,
        completed: bookingStats.completed,
        pending: bookingStats.pending,
        cancelled: bookingStats.cancelled,
      },
      rating: {
        average: Number((ratingStats.average_rating || 0).toFixed(2)),
        total_reviews: ratingStats.total_reviews || 0,
      },
      revenue: {
        total: revenueValue,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
