import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'vendor' | 'admin'
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')

    setState({
      user: user ? JSON.parse(user) : null,
      token,
      isLoading: false,
      error: null,
    })
  }, [])

  const register = useCallback(
    async (email: string, password: string, name: string, role: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Registration failed')
        }

        const data = await res.json()
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))

        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          error: null,
        })

        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
        throw error
      }
    },
    []
  )

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Login failed')
        }

        const data = await res.json()
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))

        setState({
          user: data.user,
          token: data.token,
          isLoading: false,
          error: null,
        })

        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed'
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
        throw error
      }
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    register,
    login,
    logout,
  }
}
