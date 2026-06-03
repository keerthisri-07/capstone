import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F1A] text-slate-900 dark:text-white">
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 bg-slate-50 dark:bg-[#0F0F1A]/80 border-b border-slate-200 dark:border-white/[0.06]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center"><Shield className="w-4 h-4 text-slate-900 dark:text-white" /></div>
          <span className="text-lg font-bold">SafeHer</span>
        </Link>
        <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">Sign In</Link>
      </nav>
      <div className="max-w-3xl mx-auto py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">About SafeHer</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-12">Building a safer world for women through intelligent AI technology.</p>
      </div>
    </div>
  )
}
