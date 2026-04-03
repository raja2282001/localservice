import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'
import { validateEmail, validatePassword, validateName } from '@/lib/validators'
import { handleError } from '@/lib/middleware'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, role } = body

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    if (!name || !validateName(name)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    const validRoles = ['customer', 'vendor']
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const db = await connectToDatabase()
    const users = db.collection('users')

    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const insertResult = await users.insertOne({
      email,
      password_hash: hashedPassword,
      full_name: name,
      phone: phone || null,
      role,
      created_at: new Date(),
      updated_at: new Date(),
    })

    const user = {
      id: insertResult.insertedId.toString(),
      email,
      name,
      role,
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    return handleError(error)
  }
}
