import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, requireRole, handleError } from '@/lib/middleware'
import { validateName, validateDescription, validatePrice } from '@/lib/validators'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const db = await connectToDatabase()
    const servicesCollection = db.collection('services')

    const vendorId = searchParams.get('vendorId')
    const filter: any = { is_active: true }

    if (vendorId) {
      filter.vendor_id = vendorId
    }

    if (categoryId) {
      filter.category_id = categoryId
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await servicesCollection.countDocuments(filter)
    const services = await servicesCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      services: services.map((service) => ({
        ...service,
        id: service._id.toString(),
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    })
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

    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Only vendors can create services' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, categoryId, price, duration, image_url } = body

    // Validation
    if (!name || !validateName(name)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (!description || !validateDescription(description)) {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 })
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category required' }, { status: 400 })
    }

    if (!price || !validatePrice(price)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    if (!duration || duration < 15 || duration > 480) {
      return NextResponse.json({ error: 'Duration must be between 15 and 480 minutes' }, { status: 400 })
    }

    // Create service
    const db = await connectToDatabase()
    const servicesCollection = db.collection('services')

    const result = await servicesCollection.insertOne({
      vendor_id: user.id,
      category_id: categoryId,
      name,
      description,
      price,
      duration,
      image_url: image_url || null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const createdService = await servicesCollection.findOne({ _id: result.insertedId })

    return NextResponse.json(
      {
        ...createdService,
        id: createdService?._id.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}
