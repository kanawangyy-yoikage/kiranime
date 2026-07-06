import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User } from 'firebase/auth'
import {
  auth,
  onAuthChange,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout as firebaseLogout,
  updateUserProfile,
  getUserFirestore,
} from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  loginWithGoogle: () => Promise<any>
  loginWithEmail: (email: string, password: string) => Promise<any>
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<any>
  logout: () => Promise<any>
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<any>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null)
      return
    }
    const data = await getUserFirestore(auth.currentUser.uid)
    setProfile(data)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user)
      if (user) {
        const data = await getUserFirestore(user.uid)
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user) return { success: false, error: 'No user' }
    const result = await updateUserProfile(user, updates)
    await refreshProfile()
    return result
  }

  const value = {
    user,
    profile,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout: firebaseLogout,
    updateProfile,
    refreshProfile,
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
