'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  image_url?: string
  category_name: string
  vendor_name: string
}

interface Category {
  id: string
  name: string
}

export default function ServicesPage() {
  const { data: categories } = useApi<Category[]>()
  const { data: servicesData, isLoading, get } = useApi<any>()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCategories()
    loadServices()
  }, [])

  useEffect(() => {
    loadServices()
  }, [selectedCategory, search])

  const loadCategories = async () => {
    try {
      await get('/api/categories')
    } catch (err) {
      console.error('Failed to load categories')
    }
  }

  const loadServices = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (search) params.set('search', search)

      await get(`/api/services?${params.toString()}`)
    } catch (err) {
      console.error('Failed to load services')
    }
  }

  const services = servicesData?.services || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ServiceHub
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-balance">Find Services</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories?.map((cat: Category) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: Service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {service.image_url && (
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <span className="text-primary font-bold">${service.price}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{service.category_name}</p>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{service.duration} mins</span>
                      <span className="text-primary font-semibold">{service.vendor_name}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
