import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await connectToDatabase()
    const services = db.collection('services')
    const users = db.collection('users')
    const categories = db.collection('categories')
    const reviewsCollection = db.collection('reviews')

    const serviceDoc = await services.findOne({ _id: new ObjectId(id), is_active: true })
    if (!serviceDoc) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const vendor = await users.findOne({ _id: new ObjectId(serviceDoc.vendor_id) })
    
    // Handle category_id - it might be a string ID or ObjectId
    let category = null
    try {
      if (serviceDoc.category_id) {
        // Try to find by ObjectId first (if it's a valid ObjectId string)
        try {
          category = await categories.findOne({ _id: new ObjectId(serviceDoc.category_id) })
        } catch (e) {
          // If not a valid ObjectId, try string match
          category = await categories.findOne({ id: serviceDoc.category_id })
        }
      }
    } catch (e) {
      console.error('Error fetching category:', e)
    }

    const reviews = await reviewsCollection
      .find({ service_id: id })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray()

    const ratingStats = await reviewsCollection
      .aggregate([
        { $match: { service_id: id } },
        { $group: { _id: null, average_rating: { $avg: '$rating' }, total_reviews: { $count: {} } } },
      ])
      .toArray()

    const rating = ratingStats[0] || { average_rating: 0, total_reviews: 0 }

    return NextResponse.json({
      ...serviceDoc,
      id: serviceDoc._id.toString(),
      vendor_name: vendor?.full_name || '',
      vendor_avatar: vendor?.avatar_url || null,
      category_name: category?.name || '',
      reviews: reviews.map((r) => ({ ...r, id: r._id?.toString() })),
      rating: {
        average: Number((rating.average_rating || 0).toFixed(2)),
        total: rating.total_reviews || 0,
      },
    })
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
    const db = await connectToDatabase()
    const services = db.collection('services')

    const serviceDoc = await services.findOne({ _id: new ObjectId(id) })
    if (!serviceDoc) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (serviceDoc.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, price, duration, is_active, image_url } = body

    const updateFields: any = {
      updated_at: new Date(),
    }
    if (name !== undefined) updateFields.name = name
    if (description !== undefined) updateFields.description = description
    if (price !== undefined) updateFields.price = price
    if (duration !== undefined) updateFields.duration = duration
    if (is_active !== undefined) updateFields.is_active = is_active
    if (image_url !== undefined) updateFields.image_url = image_url

    const updateResult = await services.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )

    const updated = updateResult.value
    if (!updated) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ ...updated, id: updated._id.toString() })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
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
    const services = db.collection('services')

    const serviceDoc = await services.findOne({ _id: new ObjectId(id) })
    if (!serviceDoc) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (serviceDoc.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await services.updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_active: false, updated_at: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
