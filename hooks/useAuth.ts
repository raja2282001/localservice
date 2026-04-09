'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCredentials, setError, setLoading, clearAuth } from '@/store/slices/authSlice'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'customer' | 'vendor' | 'admin'
}

export function useAuth() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  const login = useCallback(async (email: string, password: string) => {
    dispatch(setLoading(true))

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message = data.error || 'Login failed'
        dispatch(setError(message))
        throw new Error(message)
      }

      const data = await res.json()
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      dispatch(setCredentials({ user: data.user, token: data.token }))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch(setError(message))
      throw error
    }
  }, [dispatch])

  const register = useCallback(async ({ email, password, name, role }: RegisterData) => {
    dispatch(setLoading(true))

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message = data.error || 'Registration failed'
        dispatch(setError(message))
        throw new Error(message)
      }

      const data = await res.json()
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      dispatch(setCredentials({ user: data.user, token: data.token }))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      dispatch(setError(message))
      throw error
    }
  }, [dispatch])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    dispatch(clearAuth())
  }, [dispatch])

  return {
    ...auth,
    login,
    register,
    logout,
  }
}
