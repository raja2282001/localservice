import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { handleError } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  try {
    const categories = await sql`
      SELECT 
        c.*,
        COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id AND s.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `

    return NextResponse.json(categories)
  } catch (error) {
    return handleError(error)
  }
}
