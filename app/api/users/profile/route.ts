import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, ObjectId } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'
import { validateName, validatePhoneNumber } from '@/lib/validators'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const users = db.collection('users')
    const userDoc = await users.findOne({ _id: new ObjectId(user.id) })

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.full_name,
      phone: userDoc.phone,
      role: userDoc.role,
      bio: userDoc.bio,
      avatar_url: userDoc.avatar_url,
      address: userDoc.address,
      created_at: userDoc.created_at,
      updated_at: userDoc.updated_at,
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, bio, address, avatar_url } = body

    // Validation
    if (name && !validateName(name)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (phone && !validatePhoneNumber(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const users = db.collection('users')

    const updateResult = await users.findOneAndUpdate(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          full_name: name || undefined,
          phone: phone || undefined,
          bio: bio || undefined,
          address: address || undefined,
          avatar_url: avatar_url || undefined,
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!updateResult.value) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = updateResult.value

    return NextResponse.json({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.full_name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      bio: updatedUser.bio,
      avatar_url: updatedUser.avatar_url,
      address: updatedUser.address,
      updated_at: updatedUser.updated_at,
    })
  } catch (error) {
    return handleError(error)
  }
}
