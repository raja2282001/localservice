'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useApi } from '@/hooks/useApi'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import VendorLayout from '@/components/layouts/VendorLayout'
import { Card } from '@/components/ui/card'

export default function VendorEarningsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { data, isLoading: loadingEarnings, get } = useApi<{ earnings: { total: number; payouts: Array<any> } }>()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
    if (user?.role === 'vendor') {
      get('/api/vendors/earnings').catch(() => {})
    }
  }, [user, isLoading, router, get])

  const earnings = data?.earnings

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-2">
              Track your revenue and payout history.
            </p>
          </div>

          <Card className="p-6 bg-white">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[.2em] text-muted-foreground">Total revenue</p>
                <p className="mt-2 text-3xl font-semibold">
                  ${earnings?.total ?? '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[.2em] text-muted-foreground">Recent payouts</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  {earnings?.payouts?.length ? (
                    earnings.payouts.slice(0, 3).map((payout: any) => (
                      <div key={payout.id} className="rounded-md border border-border p-3">
                        <p>{payout.date}</p>
                        <p className="font-semibold">${payout.amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No payouts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {loadingEarnings && <Card className="p-6 bg-white">Loading earnings...</Card>}
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
