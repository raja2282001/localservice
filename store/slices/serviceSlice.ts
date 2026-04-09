import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  duration: number
  is_active?: boolean
}

interface ServiceState {
  services: ServiceItem[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: ServiceState = {
  services: [],
  status: 'idle',
  error: null,
}

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setServices(state, action: PayloadAction<ServiceItem[]>) {
      state.services = action.payload
      state.status = 'idle'
      state.error = null
    },
    addService(state, action: PayloadAction<ServiceItem>) {
      state.services.unshift(action.payload)
    },
    updateService(state, action: PayloadAction<ServiceItem>) {
      state.services = state.services.map((service) =>
        service.id === action.payload.id ? action.payload : service
      )
    },
    removeService(state, action: PayloadAction<string>) {
      state.services = state.services.filter((service) => service.id !== action.payload)
    },
    setServiceError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.status = action.payload ? 'failed' : 'idle'
    },
  },
})

export const {
  setServices,
  addService,
  updateService,
  removeService,
  setServiceError,
} = serviceSlice.actions

export default serviceSlice.reducer
