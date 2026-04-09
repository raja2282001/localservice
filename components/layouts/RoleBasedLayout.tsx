'use client'

import { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import AdminLayout from '@/components/layouts/AdminLayout'
import CustomerLayout from '@/components/layouts/CustomerLayout'
import VendorLayout from '@/components/layouts/VendorLayout'

interface RoleBasedLayoutProps {
  children: ReactNode
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const user = useAppSelector((state) => state.auth.user)

  if (user?.role === 'admin') {
    return <AdminLayout>{children}</AdminLayout>
  }

  if (user?.role === 'vendor') {
    return <VendorLayout>{children}</VendorLayout>
  }

  return <CustomerLayout>{children}</CustomerLayout>
}
