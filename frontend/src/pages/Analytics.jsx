import AppLayout from '../components/layout/AppLayout'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, ShieldAlert, Navigation } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const lineData = [
  { day: 'Mon', score: 75 }, { day: 'Tue', score: 80 }, { day: 'Wed', score: 82 },
  { day: 'Thu', score: 78 }, { day: 'Fri', score: 85 }, { day: 'Sat', score: 88 }, { day: 'Sun', score: 90 }
]

const pieData = [
  { name: 'Harassment', value: 40, color: '#7c3aed' },
  { name: 'Stalking', value: 25, color: '#4f46e5' },
  { name: 'Cyber', value: 20, color: '#2563eb' },
  { name: 'Other', value: 15, color: '#64748b' }
]

export default function Analytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-violet-400" />
            Safety Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Insights and trends based on your activity</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Journeys', value: '42', icon: Navigation, color: 'text-indigo-400' },
            { label: 'Avg Safety Score', value: '85', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'SOS Events', value: '0', icon: ShieldAlert, color: 'text-amber-400' },
            { label: 'Incidents Logged', value: '3', icon: BarChart2, color: 'text-violet-400' }
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
              <s.icon className={`w-5 h-5 mb-3 ${s.color}`} />
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{s.value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Safety Score Trend (7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#13131f', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Incident Types Breakdown</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#13131f', borderColor: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
