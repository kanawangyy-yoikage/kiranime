// ─── FIREBASE CLIENT ─────────────────────────────────────────
// Firebase + Base64 tricks untuk free tier

import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// ─── CONFIG ──────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
}

// ─── INITIALIZATION ──────────────────────────────────────────

const app = initializeApp(firebaseConfig)
const authInstance = typeof window !== 'undefined' ? getAuth(app) : undefined
export const auth = authInstance!
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// ─── AUTH FUNCTIONS ──────────────────────────────────────────

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    await syncUserToFirestore(result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('Google login error:', error)
    return { success: false, error }
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await syncUserToFirestore(result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('Email login error:', error)
    return { success: false, error }
  }
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    await syncUserToFirestore(result.user)
    return { success: true, user: result.user }
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error }
  }
}

export async function logout() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error }
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

export async function updateUserProfile(user: User, updates: { displayName?: string; photoURL?: string }) {
  try {
    await updateProfile(user, updates)
    if (updates.displayName) {
      await updateUserFirestore(user.uid, { displayName: updates.displayName })
    }
    if (updates.photoURL) {
      await updateUserFirestore(user.uid, { photoURL: updates.photoURL })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

// ─── FIRESTORE FUNCTIONS ─────────────────────────────────────

export async function syncUserToFirestore(user: User) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    // User baru
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'KiraFan',
      photoURL: user.photoURL || '',
      role: 'user',
      createdAt: serverTimestamp(),
      provider: user.providerData?.[0]?.providerId || 'email',
      bio: '',
      bannerURL: '',
      bannerColor: 'linear-gradient(135deg, #1a237e, #5B88B2, #A8C7FA)',
      stats: {
        watchedEpisodes: 0,
        totalHours: 0,
        averageScore: 0,
        watchlistCount: 0,
      },
    })
  } else {
    // Update data lama
    const updates: any = {}
    const data = userSnap.data()
    
    if (user.email && data.email !== user.email) updates.email = user.email
    if (user.displayName && !data.displayName) updates.displayName = user.displayName
    if (user.photoURL && !data.photoURL) updates.photoURL = user.photoURL
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates)
    }
  }
}

export async function getUserFirestore(uid: string) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}

export async function updateUserFirestore(uid: string, updates: any) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() })
}

// ─── BASE64 TRICK FUNCTIONS ──────────────────────────────────
// Trick untuk menyimpan data di Firestore free tier tanpa biaya read/write

export function encodeData(data: any): string {
  try {
    const json = JSON.stringify(data)
    const base64 = btoa(encodeURIComponent(json))
    return base64
  } catch {
    return ''
  }
}

export function decodeData(encoded: string): any {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Gunakan Base64 untuk menyimpan data besar (seperti history) di localStorage
export const LOCAL_STORAGE_KEYS = {
  HISTORY: 'kira-history',
  FAVORITES: 'kira-favorites',
  WATCHLIST: 'kira-watchlist',
  CONTINUE_WATCHING: 'kira-continue',
}

export function saveToLocal(key: string, data: any) {
  try {
    const encoded = encodeData(data)
    localStorage.setItem(key, encoded)
    return true
  } catch {
    return false
  }
}

export function loadFromLocal(key: string) {
  try {
    const encoded = localStorage.getItem(key)
    return encoded ? decodeData(encoded) : null
  } catch {
    return null
  }
}

export function clearLocal(key: string) {
  localStorage.removeItem(key)
}

// ─── USER COLLECTIONS ────────────────────────────────────────

export async function saveHistory(animeData: any) {
  const user = auth.currentUser
  if (!user) return null
  
  const historyRef = doc(db, 'users', user.uid, 'history', encodeURIComponent(animeData.slug))
  await setDoc(historyRef, {
    ...animeData,
    timestamp: serverTimestamp(),
    lastWatchedAt: Date.now(),
    progress: animeData.progress || 0,
  })
  
  // Simpan juga di localStorage sebagai backup
  const localHistory = loadFromLocal(LOCAL_STORAGE_KEYS.HISTORY) || []
  localHistory.unshift({
    ...animeData,
    timestamp: Date.now(),
    progress: animeData.progress || 0,
  })
  saveToLocal(LOCAL_STORAGE_KEYS.HISTORY, localHistory.slice(0, 50))
  
  return historyRef
}

export async function getHistory(limitCount = 20) {
  const user = auth.currentUser
  if (!user) return []
  
  try {
    const historyRef = collection(db, 'users', user.uid, 'history')
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch {
    // Fallback ke localStorage
    const localHistory = loadFromLocal(LOCAL_STORAGE_KEYS.HISTORY) || []
    return localHistory.slice(0, limitCount)
  }
}

export async function toggleFavorite(animeData: any) {
  const user = auth.currentUser
  if (!user) return { success: false, isFavorited: false }
  
  const favRef = doc(db, 'users', user.uid, 'favorites', encodeURIComponent(animeData.slug))
  const favSnap = await getDoc(favRef)
  
  if (favSnap.exists()) {
    await deleteDoc(favRef)
    return { success: true, isFavorited: false }
  } else {
    await setDoc(favRef, {
      ...animeData,
      timestamp: serverTimestamp(),
      addedAt: Date.now(),
    })
    return { success: true, isFavorited: true }
  }
}

export async function getFavorites() {
  const user = auth.currentUser
  if (!user) return []
  
  try {
    const favRef = collection(db, 'users', user.uid, 'favorites')
    const q = query(favRef, orderBy('timestamp', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch {
    // Fallback ke localStorage
    const localFavs = loadFromLocal(LOCAL_STORAGE_KEYS.FAVORITES) || []
    return localFavs
  }
}

export async function checkFavorite(slug: string) {
  const user = auth.currentUser
  if (!user) return false
  
  const favRef = doc(db, 'users', user.uid, 'favorites', encodeURIComponent(slug))
  const favSnap = await getDoc(favRef)
  return favSnap.exists()
}

// ─── WATCHLIST ───────────────────────────────────────────────

export type WatchlistStatus = 'planning' | 'watching' | 'completed' | 'dropped'

export interface WatchlistItem {
  slug: string
  title: string
  image: string
  status: WatchlistStatus
  progress?: number
  totalEpisodes?: number
  score?: number
  notes?: string
  addedAt: number
  updatedAt: number
}

export async function addToWatchlist(item: Omit<WatchlistItem, 'addedAt' | 'updatedAt'>) {
  const user = auth.currentUser
  if (!user) return false
  
  const watchlistRef = doc(db, 'users', user.uid, 'watchlist', encodeURIComponent(item.slug))
  await setDoc(watchlistRef, {
    ...item,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  
  // Simpan di localStorage juga
  const localWatchlist = loadFromLocal(LOCAL_STORAGE_KEYS.WATCHLIST) || []
  const existingIndex = localWatchlist.findIndex((w: any) => w.slug === item.slug)
  
  if (existingIndex >= 0) {
    localWatchlist[existingIndex] = {
      ...item,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    }
  } else {
    localWatchlist.push({
      ...item,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
  
  saveToLocal(LOCAL_STORAGE_KEYS.WATCHLIST, localWatchlist)
  return true
}

export async function updateWatchlistStatus(slug: string, status: WatchlistStatus) {
  const user = auth.currentUser
  if (!user) return false
  
  const watchlistRef = doc(db, 'users', user.uid, 'watchlist', encodeURIComponent(slug))
  await updateDoc(watchlistRef, {
    status,
    updatedAt: serverTimestamp(),
  })
  return true
}

export async function getWatchlistByStatus(status?: WatchlistStatus) {
  const user = auth.currentUser
  if (!user) return []
  
  try {
    const watchlistRef = collection(db, 'users', user.uid, 'watchlist')
    let q = query(watchlistRef, orderBy('addedAt', 'desc'))
    
    if (status) {
      q = query(watchlistRef, where('status', '==', status), orderBy('addedAt', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch {
    // Fallback ke localStorage
    const localWatchlist = loadFromLocal(LOCAL_STORAGE_KEYS.WATCHLIST) || []
    if (status) {
      return localWatchlist.filter((item: any) => item.status === status)
    }
    return localWatchlist
  }
}

// ─── CONTINUE WATCHING ───────────────────────────────────────

export async function saveContinueWatching(slug: string, episodeSlug: string, progress: number) {
  const user = auth.currentUser
  if (!user) return false
  
  const continueRef = doc(db, 'users', user.uid, 'continue', encodeURIComponent(slug))
  await setDoc(continueRef, {
    slug,
    episodeSlug,
    progress,
    timestamp: serverTimestamp(),
    lastWatched: Date.now(),
  })
  
  // Simpan di localStorage juga
  const localContinue = loadFromLocal(LOCAL_STORAGE_KEYS.CONTINUE_WATCHING) || []
  const existingIndex = localContinue.findIndex((c: any) => c.slug === slug)
  
  if (existingIndex >= 0) {
    localContinue[existingIndex] = { slug, episodeSlug, progress, lastWatched: Date.now() }
  } else {
    localContinue.push({ slug, episodeSlug, progress, lastWatched: Date.now() })
  }
  
  saveToLocal(LOCAL_STORAGE_KEYS.CONTINUE_WATCHING, localContinue)
  return true
}

export async function getContinueWatching() {
  const user = auth.currentUser
  if (!user) return []
  
  try {
    const continueRef = collection(db, 'users', user.uid, 'continue')
    const q = query(continueRef, orderBy('timestamp', 'desc'), limit(10))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch {
    // Fallback ke localStorage
    return loadFromLocal(LOCAL_STORAGE_KEYS.CONTINUE_WATCHING) || []
  }
}

// ─── STORAGE ─────────────────────────────────────────────────

export async function uploadAvatar(file: File, uid: string) {
  try {
    const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return { success: true, url: downloadURL }
  } catch (error) {
    return { success: false, error }
  }
}

export async function uploadBanner(file: File, uid: string) {
  try {
    const storageRef = ref(storage, `banners/${uid}/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)
    return { success: true, url: downloadURL }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteFile(url: string) {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

// ─── STATS ───────────────────────────────────────────────────

export async function updateStats(updates: {
  watchedEpisodes?: number
  totalHours?: number
  averageScore?: number
  watchlistCount?: number
}) {
  const user = auth.currentUser
  if (!user) return false
  
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) return false
  
  const currentStats = userSnap.data().stats || {}
  const newStats = { ...currentStats, ...updates }
  
  await updateDoc(userRef, { stats: newStats })
  return true
}
