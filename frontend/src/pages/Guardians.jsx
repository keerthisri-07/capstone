import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Phone, Shield, Bell, X, Check } from 'lucide-react'
import { useState } from 'react'

const mockGuardians = [
  { id: 1, name: 'Priya Sharma', relation: 'Mother', phone: '+91 98765 43210', status: 'Active', online: true },
  { id: 2, name: 'Rahul Verma', relation: 'Brother', phone: '+91 98765 43211', status: 'Active', online: false },
]

export default function Guardians() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-400" />
              Guardian Network
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your trusted emergency contacts</p>
          </motion.div>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Guardian
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGuardians.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-slate-900 dark:text-white font-bold relative">
                    {g.name[0]}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F0F1A] ${g.online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-semibold">{g.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{g.relation}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">{g.status}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm mb-4">
                <Phone className="w-4 h-4 text-slate-500" /> {g.phone}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs hover:bg-white/[0.05]">Edit</button>
                <button className="flex-1 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10">Remove</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[#13131f] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Guardian</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500" />
                <select className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500">
                  <option>Family</option>
                  <option>Friend</option>
                  <option>Colleague</option>
                </select>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">Cancel</button>
                  <button className="flex-1 py-2.5 rounded-xl bg-violet-600 text-slate-900 dark:text-white font-medium">Send Invite</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
