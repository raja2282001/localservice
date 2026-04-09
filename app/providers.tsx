'use client'

import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import store from '@/store'
import { setCredentials } from '@/store/slices/authSlice'

interface ProvidersProps {
  children: ReactNode
}

function AuthHydration({ children }: ProvidersProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        store.dispatch(setCredentials({ user: parsedUser, token }))
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  return <>{children}</>
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthHydration>{children}</AuthHydration>
    </Provider>
  )
}
