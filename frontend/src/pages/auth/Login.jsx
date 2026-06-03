import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin,
  Bell, Bot, Users, AlertOctagon, ChevronRight, Sparkles
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: MapPin, text: 'Real-time journey monitoring & safe route alerts' },
  { icon: Bell, text: 'Instant guardian notifications on SOS' },
  { icon: Bot, text: 'AI-powered distress detection & analysis' },
  { icon: AlertOctagon, text: 'One-tap emergency response system' },
  { icon: Users, text: 'Guardian network management' },
]

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || '/dashboard'

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 4) errs.password = 'Password too short'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setIsLoading(true)
    try {
      const result = await login(form.email, form.password)
      toast.success(`Welcome back, ${result.user?.name?.split(' ')[0] || 'there'}! 👋`)
      setTimeout(() => navigate(from, { replace: true }), 300)
    } catch (err) {
      toast.error('Invalid credentials. Use demo credentials below.')
      setErrors({ general: 'Invalid email or password' })
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (type) => {
    const creds = {
      admin: { email: 'admin@safeher.ai', password: 'demo123' },
      user: { email: 'priya@example.com', password: 'demo123' },
    }
    setForm(creds[type])
    setErrors({})
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F0F1A]">
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 40%, #0F0F1A 100%)',
        }}
      >
        {/* Animated mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating shield */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
          <Shield className="w-96 h-96 text-purple-300" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Shield className="w-6 h-6 text-slate-900 dark:text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">SafeHer</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-4 py-1.5 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-xs text-purple-300 font-semibold">AI-Powered Safety Platform</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-black text-slate-900 dark:text-white leading-tight"
            >
              Your Safety,
              <br />
              <span className="gradient-text">Our Priority.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 mt-3 text-base leading-relaxed max-w-sm"
            >
              Join 10,000+ women who travel safer every day with AI-powered safety monitoring and instant emergency response.
            </motion.p>
          </div>

          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.li key={i} variants={itemVariants} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10"
          >
            {[
              { value: '10K+', label: 'Protected' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<30s', label: 'Response' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-gray-600">
          © 2026 SafeHer. All rights reserved.
        </div>
      </motion.div>

      {/* ── RIGHT PANEL (FORM) ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 bg-slate-50 dark:bg-[#0F0F1A]"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-900 dark:text-white" />
            </div>
            <span className="text-xl font-black gradient-text">SafeHer</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-8">
              Sign in to your SafeHer account
            </p>

            {/* Demo credentials card */}
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fillDemo('user')}
                  className="text-left bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition-all group"
                >
                  <p className="text-xs font-semibold text-gray-300 group-hover:text-slate-900 dark:text-white">User Demo</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">priya@example.com</p>
                  <p className="text-[10px] text-gray-500">demo123</p>
                </button>
                <button
                  onClick={() => fillDemo('admin')}
                  className="text-left bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition-all group"
                >
                  <p className="text-xs font-semibold text-gray-300 group-hover:text-slate-900 dark:text-white">Admin Demo</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">admin@safeher.ai</p>
                  <p className="text-[10px] text-gray-500">demo123</p>
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">Click a card to auto-fill credentials</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
                >
                  {errors.general}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-gray-700 focus:ring-purple-500/40 focus:border-purple-500/50'
                    }`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={`w-full bg-white/5 border rounded-xl pl-11 pr-12 py-3 text-slate-900 dark:text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-gray-700 focus:ring-purple-500/40 focus:border-purple-500/50'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-slate-900 dark:text-white text-sm flex items-center justify-center gap-2 mt-2 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
                style={{
                  background: 'linear-gradient(135deg, #5B21B6, #4338CA)',
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Create one free
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
