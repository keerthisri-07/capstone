import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, FileText, Download, AlertTriangle, Shield, Clock, MapPin, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'

const mockIncidents = [
  { id: 1, title: 'Suspicious person at metro station', type: 'Stalking', severity: 'High', date: '2023-10-25', status: 'Under Review', location: 'MG Road' },
  { id: 2, title: 'Online harassment on Instagram', type: 'Cyber Abuse', severity: 'Medium', date: '2023-10-20', status: 'Resolved', location: 'Online' },
  { id: 3, title: 'Cab driver took wrong route', type: 'Physical Threat', severity: 'High', date: '2023-10-15', status: 'Resolved', location: 'Koramangala' }
]

export default function IncidentReports() {
  const [showNewPanel, setShowNewPanel] = useState(false)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-violet-400" />
              Incident Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log and track safety incidents with AI intelligence</p>
          </motion.div>
          <button onClick={() => setShowNewPanel(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-slate-900 dark:text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Incident
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search incidents..." className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-violet-500 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2"><Filter className="w-4 h-4" /> Filter</button>
          </div>
        </div>

        <div className="space-y-4">
          {mockIncidents.map((incident, i) => (
            <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/30 transition-all group cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-semibold">{incident.title}</h3>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-1">
                      <span>{incident.date}</span> •
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${incident.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{incident.severity}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${incident.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{incident.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Incident Side Panel */}
      <AnimatePresence>
        {showNewPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewPanel(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#13131f] border-l border-slate-200 dark:border-white/[0.08] z-50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Incident</h2>
                <button onClick={() => setShowNewPanel(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg hover:bg-white/[0.05]"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-sm mb-1.5 block">Title</label>
                  <input type="text" placeholder="Brief summary" className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-sm mb-1.5 block">Description</label>
                  <textarea rows="4" placeholder="What happened?" className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 text-sm mb-1.5 block">Severity</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map(s => (
                      <button key={s} className="flex-1 py-2 text-xs font-medium rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white/[0.08]">{s}</button>
                    ))}
                  </div>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-900 dark:text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 mt-4">Submit Report</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
