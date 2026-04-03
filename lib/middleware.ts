import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromHeader } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: 'customer' | 'vendor' | 'admin'
  }
}

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = getTokenFromHeader(authHeader)

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await verifyAuth(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return user
}

export function requireRole(allowedRoles: string[]) {
  return async (user: any) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return null
  }
}

export function handleError(error: any) {
  console.error('[v0] Error:', error)

  if (error.message.includes('Unauthorized')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (error.message.includes('Forbidden')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (error.message.includes('Not found')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
