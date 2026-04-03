import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { verifyPassword, createToken } from '@/lib/auth'
import { validateEmail } from '@/lib/validators'
import { handleError } from '@/lib/middleware'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Find user
    const db = await connectToDatabase()
    const users = db.collection('users')
    const userDoc = await users.findOne({ email })

    if (!userDoc) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.full_name,
      role: userDoc.role,
      password_hash: userDoc.password_hash,
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    return handleError(error)
  }
}
