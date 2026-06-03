import AppLayout from '../components/layout/AppLayout'
import { motion } from 'framer-motion'
import { Shield, Users, AlertTriangle, Activity, Database, Server } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 min-h-screen bg-slate-50 dark:bg-[#0F0F1A] space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            Admin Control Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform management and oversight</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '247', icon: Users, color: 'text-violet-400' },
            { label: 'Active SOS', value: '2', icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Open Incidents', value: '8', icon: Shield, color: 'text-amber-400' },
            { label: 'System Health', value: '99.8%', icon: Activity, color: 'text-emerald-400' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
              <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{s.value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3"><Database className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span className="text-sm text-slate-700 dark:text-slate-300">MongoDB</span></div>
                <span className="text-emerald-400 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3"><Server className="w-4 h-4 text-slate-500 dark:text-slate-400" /><span className="text-sm text-slate-700 dark:text-slate-300">AI Service</span></div>
                <span className="text-emerald-400 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
