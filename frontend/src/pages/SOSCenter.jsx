import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ShieldAlert, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { useState } from 'react'
import SOSButton from '../components/ui/SOSButton'

const helplines = [
  { name: 'Police', number: '100', icon: '🚓' },
  { name: 'Fire', number: '101', icon: '🚒' },
  { name: 'Emergency', number: '112', icon: '🚨' },
  { name: 'Women Helpline', number: '181', icon: '👩' },
  { name: 'Cyber Crime', number: '1930', icon: '💻' }
]

const mockHistory = [
  { id: 1, time: '2 hours ago', location: 'MG Road', status: 'Resolved', duration: '15m' },
  { id: 2, time: 'Last week', location: 'Indiranagar', status: 'Resolved', duration: '45m' }
]

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 dark:border-white/[0.08] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full py-4 flex items-center justify-between text-left focus:outline-none">
        <span className="text-slate-900 dark:text-white font-medium">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-slate-500 dark:text-slate-400 text-sm pb-4">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SOSCenter() {
  const [fakeCallActive, setFakeCallActive] = useState(false)
  const [callerName, setCallerName] = useState('Mom 👩')

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            SOS Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Emergency tools and resources</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main SOS Trigger Area */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-gradient-to-br from-red-900/40 to-[#0F0F1A] border border-red-500/20 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-red-400 font-semibold text-lg mb-3">Need immediate help?</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                Use the floating SOS button at the bottom right corner of any page to trigger an emergency alert instantly.
              </p>
            </motion.div>

            {/* Fake Call */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Fake Call Simulator</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Trigger a realistic fake incoming call to help you safely exit an uncomfortable situation.</p>
              <div className="flex gap-4">
                <input type="text" value={callerName} onChange={(e) => setCallerName(e.target.value)} placeholder="Caller Name" className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500" />
                <button onClick={() => setFakeCallActive(true)} className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20">Trigger Call</button>
              </div>
            </motion.div>

            {/* History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Recent SOS Events</h2>
              <div className="space-y-3">
                {mockHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white text-sm">{item.location}</p>
                        <p className="text-slate-500 text-xs">{item.time} • Duration: {item.duration}</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10">{item.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Quick Dial */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Nearby Helplines</h2>
              <div className="space-y-3">
                {helplines.map((h, i) => (
                  <a href={`tel:${h.number}`} key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-violet-500/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{h.icon}</span>
                      <span className="text-slate-900 dark:text-white text-sm font-medium">{h.name}</span>
                    </div>
                    <span className="text-violet-400 font-bold group-hover:scale-110 transition-transform">{h.number}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Guidelines */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-400" />
                Emergency Guidelines
              </h2>
              <AccordionItem title="What happens when I trigger SOS?" content="Your location is instantly shared with all your guardians. Local authorities may be contacted depending on your settings." />
              <AccordionItem title="How to use the Fake Call feature?" content="Enter a name (e.g., 'Mom' or 'Police') and tap 'Trigger'. Your phone will simulate an incoming call with a realistic ringtone after 3 seconds." />
              <AccordionItem title="What to do during an emergency?" content="Stay calm, find a well-lit public area if possible, and keep your phone accessible. Follow instructions from emergency responders." />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fake Call Modal */}
      <AnimatePresence>
        {fakeCallActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center w-full max-w-sm">
              <div className="text-center mb-16">
                <p className="text-slate-500 dark:text-slate-400 text-xl mb-2">Incoming call</p>
                <h2 className="text-slate-900 dark:text-white text-5xl font-light">{callerName}</h2>
              </div>
              <div className="flex gap-16 mt-32">
                <button onClick={() => setFakeCallActive(false)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8 text-slate-900 dark:text-white rotate-[135deg]" />
                </button>
                <button onClick={() => setFakeCallActive(false)} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-110 transition-transform animate-pulse">
                  <Phone className="w-8 h-8 text-slate-900 dark:text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
