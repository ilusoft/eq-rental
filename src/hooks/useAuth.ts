import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { Profile } from '@/types'

interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

interface UseAuthReturn {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  isOwner: boolean
  isSystemOwner: boolean
  isRenter: boolean
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { user, loading } = context

  const isOwner = user?.profile?.role === 'owner'
  const isSystemOwner = user?.profile?.role === 'system_owner'
  const isRenter = user?.profile?.role === 'renter'

  const signOut = async () => {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.id) return

    const { supabase } = await import('@/lib/supabase')
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) throw error
  }

  return {
    user,
    profile: user?.profile || null,
    loading,
    isAuthenticated: !!user,
    isOwner,
    isSystemOwner,
    isRenter,
    signOut,
    updateProfile,
  }
}