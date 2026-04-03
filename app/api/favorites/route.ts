import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAuth, handleError } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await sql`
      SELECT s.* FROM services s
      JOIN favorites f ON s.id = f.service_id
      WHERE f.customer_id = ${user.id}
      ORDER BY f.created_at DESC
    `

    return NextResponse.json(favorites)
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

    const body = await req.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await sql`
      SELECT id FROM favorites WHERE customer_id = ${user.id} AND service_id = ${serviceId}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }

    // Add favorite
    const result = await sql`
      INSERT INTO favorites (customer_id, service_id, created_at)
      VALUES (${user.id}, ${serviceId}, NOW())
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { serviceId } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    await sql`
      DELETE FROM favorites WHERE customer_id = ${user.id} AND service_id = ${serviceId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
