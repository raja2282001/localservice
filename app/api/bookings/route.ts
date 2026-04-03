import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const db = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')
    const servicesCollection = db.collection('services')
    const usersCollection = db.collection('users')

    let filter: any = {}

    if (user.role === 'customer') {
      filter.customer_id = user.id
    } else if (user.role === 'vendor') {
      // Get services for this vendor first
      const vendorServices = await servicesCollection
        .find({ vendor_id: user.id })
        .project({ _id: 1 })
        .toArray()

      const serviceIds = vendorServices.map((s) => s._id.toString())
      filter.service_id = { $in: serviceIds }
    }

    if (status) {
      filter.status = status
    }

    const bookings = await bookingsCollection
      .find(filter)
      .sort({ booking_date: -1 })
      .toArray()

    // Enrich with service and customer info
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const service = await servicesCollection.findOne({ _id: new ObjectId(booking.service_id) })
        const customer = await usersCollection.findOne({ _id: new ObjectId(booking.customer_id) })

        return {
          ...booking,
          id: booking._id.toString(),
          service_name: service?.name || '',
          service_price: service?.price || 0,
          customer_name: customer?.full_name || '',
          vendor_name: service?.vendor_id ? 'Vendor' : '',
        }
      })
    )

    return NextResponse.json(enrichedBookings)
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
      return NextResponse.json({ error: 'Only customers can create bookings' }, { status: 403 })
    }

    const body = await req.json()
    const { serviceId, bookingDate, notes } = body

    // Validate input
    if (!serviceId || !bookingDate) {
      return NextResponse.json({ error: 'Service ID and booking date required' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const servicesCollection = db.collection('services')
    const bookingsCollection = db.collection('bookings')

    // Validate service exists
    const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check date is in future
    const bookingDateTime = new Date(bookingDate)
    if (bookingDateTime <= new Date()) {
      return NextResponse.json({ error: 'Booking date must be in the future' }, { status: 400 })
    }

    // Create booking
    const result = await bookingsCollection.insertOne({
      customer_id: user.id,
      service_id: serviceId,
      booking_date: bookingDateTime,
      notes: notes || null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    })

    const created = await bookingsCollection.findOne({ _id: result.insertedId })

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
