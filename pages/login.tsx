import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Phone, Mail as MailIcon } from 'lucide-react'
import type { ConfirmationResult } from 'firebase/auth'
import { useAuth } from '@/contexts/AuthContext'
import { sendPhoneOtp, confirmPhoneOtp } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()
  
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ─── Phone (OTP) state ───────────────────────────────────
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Menormalkan input nomor HP Indonesia ke format E.164 (+62...)
  const normalizePhoneNumber = (input: string) => {
    const v = input.trim().replace(/[\s-()]/g, '')
    if (v.startsWith('+')) return v
    if (v.startsWith('62')) return `+${v}`
    if (v.startsWith('0')) return `+62${v.slice(1)}`
    return `+62${v}`
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await loginWithGoogle()
      if (result.success) {
        router.push('/')
      } else {
        setError('Login Google-nya gagal, coba sekali lagi ya.')
      }
    } catch (err) {
      setError('Ada gangguan pas coba login. Coba beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const result = await loginWithEmail(email, password)
        if (result.success) {
          router.push('/')
        } else {
          setError('Email atau password salah.')
        }
      } else {
        if (!displayName.trim()) {
          setError('Nama wajib diisi')
          setLoading(false)
          return
        }
        const result = await registerWithEmail(email, password, displayName)
        if (result.success) {
          router.push('/')
        } else {
          setError('Registrasi gagal, mungkin email ini sudah dipakai.')
        }
      }
    } catch (err) {
      setError('Ada yang error di sistem. Coba lagi sebentar ya.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formatted = normalizePhoneNumber(phoneNumber)
      const result = await sendPhoneOtp(formatted, 'recaptcha-container')
      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult)
        setOtpSent(true)
      } else {
        setError('Kode OTP gagal dikirim, coba cek lagi nomor HP-nya.')
      }
    } catch (err) {
      setError('Lagi ada masalah di server. Coba lagi sebentar.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmationResult) return
    setLoading(true)
    setError('')

    try {
      const result = await confirmPhoneOtp(confirmationResult, otpCode)
      if (result.success) {
        router.push('/')
      } else {
        setError('Kode OTP-nya salah atau sudah keburu kadaluarsa.')
      }
    } catch (err) {
      setError('Verifikasinya gagal karena ada gangguan. Coba lagi ya.')
    } finally {
      setLoading(false)
    }
  }

  const resetPhoneFlow = () => {
    setOtpSent(false)
    setOtpCode('')
    setConfirmationResult(null)
    setError('')
  }

  return (
    <>
      <Head>
        <title>{method === 'phone' ? 'Login No. HP' : mode === 'login' ? 'Login' : 'Register'} - KiraStream</title>
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Image
                src="/logo-title.png"
                alt="KiraStream"
                width={180}
                height={60}
                className="h-12 w-auto object-contain mx-auto mb-2"
                priority
              />
              <p className="text-pearl/60">
                {method === 'phone'
                  ? 'Login pakai nomor HP'
                  : mode === 'login' ? 'Login ke akun kamu' : 'Buat akun baru'}
              </p>
            </div>

            {/* Method Tabs */}
            <div className="flex mb-6 rounded-xl bg-surface-card p-1">
              <button
                type="button"
                onClick={() => { setMethod('email'); resetPhoneFlow() }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  method === 'email' ? 'bg-ocean text-white' : 'text-pearl/60 hover:text-pearl'
                }`}
              >
                <MailIcon size={15} /> Email
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  method === 'phone' ? 'bg-ocean text-white' : 'text-pearl/60 hover:text-pearl'
                }`}
              >
                <Phone size={15} /> No. HP
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === 'email' ? (
                <motion.div
                  key="email-method"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Google Login */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Login dengan Google
                  </button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-ocean/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-surface-card text-pearl/60">atau</span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <div>
                        <label className="block text-sm font-medium text-pearl mb-2">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="input-field"
                          placeholder="Masukkan nama"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-pearl mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pearl mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
                    </button>
                  </form>

                  {/* Toggle Mode */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                      className="text-sm text-ocean hover:text-oceanAccent-secondary transition-colors"
                    >
                      {mode === 'login' ? 'Belum punya akun? Register' : 'Sudah punya akun? Login'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="phone-method"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-pearl mb-2">
                          Nomor HP
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="input-field"
                          placeholder="08123456789"
                          required
                        />
                        <p className="mt-1.5 text-xs text-pearl/50">
                          Contoh: 08123456789 atau +6281234567890
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !phoneNumber.trim()}
                        className="w-full btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-pearl mb-2">
                          Kode OTP
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="input-field tracking-[0.5em] text-center"
                          placeholder="123456"
                          maxLength={6}
                          required
                        />
                        <p className="mt-1.5 text-xs text-pearl/50">
                          Kode OTP dikirim lewat SMS ke {normalizePhoneNumber(phoneNumber)}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 6}
                        className="w-full btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Verifikasi...' : 'Verifikasi & Login'}
                      </button>

                      <button
                        type="button"
                        onClick={resetPhoneFlow}
                        className="w-full text-sm text-ocean hover:text-oceanAccent-secondary transition-colors"
                      >
                        Ganti nomor HP
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Container reCAPTCHA (invisible) — wajib ada di DOM untuk login nomor HP */}
            <div id="recaptcha-container" />

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-pearl/60 hover:text-pearl transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Kembali ke Beranda
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
