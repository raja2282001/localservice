import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import bookingReducer from '@/store/slices/bookingSlice'
import serviceReducer from '@/store/slices/serviceSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    service: serviceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
