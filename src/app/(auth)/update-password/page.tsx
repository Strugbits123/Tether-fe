'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-[#4338CA] font-bold text-2xl mb-1">Tether</div>
        <p className="text-sm text-[#64748B]">Your digital legacy, protected.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Set new password</h1>
        <p className="text-sm text-[#64748B] mb-6">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            required
            autoComplete="new-password"
            error={error && error.includes('match') ? error : undefined}
          />

          {error && !error.includes('match') && (
            <p className="text-sm text-[#DC2626]">{error}</p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Update password
          </Button>
        </form>
      </div>
    </div>
  )
}
