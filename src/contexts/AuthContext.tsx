import React, { createContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setLoading: () => {},
})

async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const setLoadingState = (state: boolean) => setLoading(state)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await getProfile(session.user.id)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile,
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session?.user) {
          const profile = await getProfile(session.user.id)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setLoading: setLoadingState }}>
      {children}
    </AuthContext.Provider>
  )
}