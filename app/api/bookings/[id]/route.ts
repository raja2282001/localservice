import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const db = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')
    const servicesCollection = db.collection('services')
    const usersCollection = db.collection('users')

    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Get service details
    const service = await servicesCollection.findOne({ _id: new ObjectId(booking.service_id) })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get customer and vendor details
    const customer = await usersCollection.findOne({ _id: new ObjectId(booking.customer_id) })
    const vendor = await usersCollection.findOne({ _id: new ObjectId(service.vendor_id) })

    // Check authorization
    if (user.id !== booking.customer_id && user.id !== service.vendor_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const enrichedBooking = {
      ...booking,
      id: booking._id.toString(),
      service_name: service.name,
      service_price: service.price,
      vendor_id: service.vendor_id,
      customer_name: customer?.full_name || 'Unknown',
      vendor_name: vendor?.full_name || 'Unknown',
    }

    return NextResponse.json(enrichedBooking)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    const db = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')
    const servicesCollection = db.collection('services')

    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Get service to check vendor
    const service = await servicesCollection.findOne({ _id: new ObjectId(booking.service_id) })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Authorization: customer can cancel, vendor can accept/complete
    if (user.id === booking.customer_id && status !== 'cancelled') {
      return NextResponse.json({ error: 'Customers can only cancel bookings' }, { status: 403 })
    }

    if (user.id === service.vendor_id && !['accepted', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Vendors can only accept or complete bookings' },
        { status: 403 }
      )
    }

    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update booking
    const updateResult = await bookingsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          notes: notes || booking.notes,
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    const updatedBooking = updateResult.value
    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedBooking,
      id: updatedBooking._id.toString(),
    })
  } catch (error) {
    return handleError(error)
  }
}
