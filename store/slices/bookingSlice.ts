import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BookingItem {
  id: string
  service_id: string
  status: string
  booking_date: string
  service_name?: string
  vendor_name?: string
  customer_name?: string
  service_price?: number
  notes?: string
}

interface BookingState {
  bookings: BookingItem[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: BookingState = {
  bookings: [],
  status: 'idle',
  error: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings(state, action: PayloadAction<BookingItem[]>) {
      state.bookings = action.payload
      state.status = 'idle'
      state.error = null
    },
    addBooking(state, action: PayloadAction<BookingItem>) {
      state.bookings.unshift(action.payload)
    },
    updateBooking(state, action: PayloadAction<BookingItem>) {
      state.bookings = state.bookings.map((booking) =>
        booking.id === action.payload.id ? action.payload : booking
      )
    },
    clearBookings(state) {
      state.bookings = []
      state.status = 'idle'
      state.error = null
    },
    setBookingError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.status = action.payload ? 'failed' : 'idle'
    },
  },
})

export const {
  setBookings,
  addBooking,
  updateBooking,
  clearBookings,
  setBookingError,
} = bookingSlice.actions

export default bookingSlice.reducer
