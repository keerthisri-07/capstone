import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, User, Phone, Mail } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0F0F1A]">
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-violet-950 to-[#0F0F1A] p-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><Shield className="w-5 h-5 text-slate-900 dark:text-white" /></div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">SafeHer</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">Join the SafeHer Network</h2>
        <p className="text-slate-700 dark:text-slate-300">Create your account to access AI-powered safety tools and protect yourself and your loved ones.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign up for free and stay protected.</p>

          <div className="space-y-4">
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm mb-1 block">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:border-violet-500" />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm mb-1 block">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:border-violet-500" />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-300 text-sm mb-1 block">Password</label>
              <input type="password" className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white focus:border-violet-500" />
            </div>
            <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-slate-900 dark:text-white rounded-xl font-semibold mt-4 shadow-lg shadow-violet-500/20">
              Create Account
            </button>
          </div>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-6 text-sm">
            Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
