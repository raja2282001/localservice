import { useState, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useApi<T = any>(
  initialState?: Partial<ApiState<T>>
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    ...initialState,
  })

  const request = useCallback(
    async (
      url: string,
      options: RequestInit & { token?: string } = {}
    ): Promise<T> => {
      setState({ data: null, isLoading: true, error: null })

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        }

        if (options.token) {
          headers.Authorization = `Bearer ${options.token}`
        } else if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            headers.Authorization = `Bearer ${token}`
          }
        }

        const res = await fetch(url, {
          ...options,
          headers,
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${res.status}`)
        }

        const data = await res.json()
        setState({ data, isLoading: false, error: null })
        return data
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed'
        setState((prev) => ({ ...prev, isLoading: false, error: message }))
        throw error
      }
    },
    []
  )

  const post = useCallback(
    (url: string, body?: any, options?: RequestInit & { token?: string }) =>
      request(url, { method: 'POST', body: JSON.stringify(body), ...options }),
    [request]
  )

  const put = useCallback(
    (url: string, body?: any, options?: RequestInit & { token?: string }) =>
      request(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
    [request]
  )

  const del = useCallback(
    (url: string, options?: RequestInit & { token?: string }) =>
      request(url, { method: 'DELETE', ...options }),
    [request]
  )

  const get = useCallback(
    (url: string, options?: RequestInit & { token?: string }) =>
      request(url, { method: 'GET', ...options }),
    [request]
  )

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
  }
}
