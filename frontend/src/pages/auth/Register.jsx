import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, User, Phone, Mail, Globe, Check } from 'lucide-react'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguageStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast.error('Please complete all required fields.')
      return
    }
    toast.success('Registration successful! Please sign in to create your Trust Circle.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F0F1A]">
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-violet-950 to-[#0F0F1A] p-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">SURAKSHA</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
          Join the SURAKSHA Network
        </h2>
        <p className="text-slate-700 dark:text-slate-300 max-w-md leading-relaxed mb-6">
          Set up your profile, choose your native language, and create your Trust Circle to protect yourself with AI-driven monitoring.
        </p>

        {/* Process Flow Preview */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md space-y-2 text-xs">
          <p className="font-bold text-violet-300 uppercase tracking-wider">Methodology Steps</p>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center font-bold text-[10px]">1</span>
            <span>User Registration</span>
          </div>
          <div className="flex items-center gap-2 text-violet-400 font-semibold">
            <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-bold text-[10px]">2</span>
            <span>Language Selection (Current)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">3</span>
            <span>Create Trust Circle</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Sign up for free and stay protected.</p>

          {/* Step 2: Language Selection in Registration */}
          <div className="mb-6 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 space-y-2">
            <label className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Preferred Language (भाषा चुनें)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                    language === l.code
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>{l.native}</div>
                  <div className="text-[9px] opacity-75">{l.name}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 block uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 block uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 block uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 block uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold mt-4 shadow-lg shadow-violet-500/20 text-sm"
            >
              Create Account & Continue →
            </button>
          </form>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
