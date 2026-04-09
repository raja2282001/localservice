'use client'

import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface AuthModalProps {
  onClose: () => void
  onSuccess?: () => void
}

interface PasswordRequirement {
  met: boolean
  label: string
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { login, register, error, isLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer',
  })

  const passwordRequirements = useMemo((): PasswordRequirement[] => {
    const pwd = formData.password
    return [
      { met: pwd.length >= 8, label: 'At least 8 characters' },
      { met: /[A-Z]/.test(pwd), label: 'One uppercase letter' },
      { met: /[a-z]/.test(pwd), label: 'One lowercase letter' },
      { met: /[0-9]/.test(pwd), label: 'One number' },
      { met: /[!@#$%^&*]/.test(pwd), label: 'One special character (!@#$%^&*)' },
    ]
  }, [formData.password])

  const isPasswordValid = passwordRequirements.every(req => req.met)
  const passwordErrors = passwordRequirements.filter(req => !req.met && formData.password.length > 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation for registration
    if (mode === 'register' && !isPasswordValid) {
      return
    }

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role as 'customer' | 'vendor' | 'admin',
        })
      }
      onSuccess?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="relative p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-6">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              
              {/* Password requirements display for registration */}
              {mode === 'register' && formData.password.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md space-y-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-sm ${
                        req.met ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                        req.met ? 'bg-green-600 text-white' : 'bg-muted'
                      }`}>
                        {req.met ? '✓' : '○'}
                      </span>
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Error message when password doesn't meet requirements */}
              {mode === 'register' && passwordErrors.length > 0 && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm font-medium mb-2">Password does not meet requirements:</p>
                  <ul className="text-destructive text-xs space-y-1">
                    {passwordErrors.map(err => (
                      <li key={err.label}>• {err.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2">Account Type</label>
                <select
                  name="role"
                  aria-label="Account Type"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  disabled={isLoading}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Service Provider</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || (mode === 'register' && !isPasswordValid)}
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
