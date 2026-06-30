import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from 'firebase/auth'
import {
  auth,
  onAuthChange,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout as firebaseLogout,
  updateUserProfile,
} from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<any>
  loginWithEmail: (email: string, password: string) => Promise<any>
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<any>
  logout: () => Promise<any>
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user) return { success: false, error: 'No user' }
    return await updateUserProfile(user, updates)
  }

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout: firebaseLogout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
