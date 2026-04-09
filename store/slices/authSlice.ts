import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'vendor' | 'admin'
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoading = false
      state.error = null
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.isLoading = false
    },
    clearAuth(state) {
      state.user = null
      state.token = null
      state.isLoading = false
      state.error = null
    },
  },
})

export const {
  setLoading,
  setCredentials,
  setError,
  setUser,
  clearAuth,
} = authSlice.actions

export default authSlice.reducer
