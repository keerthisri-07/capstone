import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MapPin, AlertOctagon, FileWarning, Users, Bot, Plus,
  Navigation, TrendingUp, ShieldCheck, Shield, Clock,
  Zap, ArrowRight, Activity, Star
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import SafetyScoreRing from '../components/ui/SafetyScoreRing'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import AppLayout from '../components/layout/AppLayout'
import {
  CURRENT_USER, MOCK_JOURNEYS, MOCK_SOS_EVENTS, MOCK_INCIDENTS,
  MOCK_GUARDIANS, MOCK_ACTIVITY, MOCK_RECOMMENDATIONS, MOCK_ANALYTICS
} from '../utils/mockData'
import { formatRelativeTime, getInitials, generateAvatarColor } from '../utils/helpers'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-purple-300">{payload[0].value} pts</p>
    </div>
  )
}

const Dashboard = () => {
  const user = useAuthStore((s) => s.user) || CURRENT_USER
  const safetyScore = user?.safetyScore ?? 87
  const greeting = getGreeting()
  const firstName = user?.name?.split(' ')[0] || 'there'

  const riskLevel = safetyScore >= 80 ? 'safe' : safetyScore >= 50 ? 'caution' : 'danger'
  const riskConfig = {
    safe: { label: 'All Clear — You\'re Safe', color: 'from-green-600/20 to-emerald-600/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-400', badge: 'bg-green-500/15 text-green-400 border-green-500/20' },
    caution: { label: 'Caution — Stay Alert', color: 'from-yellow-600/20 to-amber-600/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400', badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    danger: { label: 'High Risk — Take Action', color: 'from-red-600/20 to-rose-600/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/20' },
  }[riskLevel]

  const activeJourneys = MOCK_JOURNEYS.filter((j) => j.status === 'active').length
  const openIncidents = MOCK_INCIDENTS.filter((i) => i.status !== 'resolved').length
  const activeGuardians = MOCK_GUARDIANS.filter((g) => g.status === 'active').length
  const sosThisMonth = MOCK_SOS_EVENTS.length

  const chartData = MOCK_ANALYTICS.safetyHistory.slice(-7)

  const QUICK_ACTIONS = [
    { label: 'Start Journey', icon: Navigation, to: '/journey', color: 'bg-purple-600 hover:bg-purple-500', shadow: 'shadow-purple-500/30' },
    { label: 'Report Incident', icon: FileWarning, to: '/incidents', color: 'bg-orange-500 hover:bg-orange-400', shadow: 'shadow-orange-500/30' },
    { label: 'Chat with Chitti', icon: Bot, to: '/assistant', color: 'bg-indigo-600 hover:bg-indigo-500', shadow: 'shadow-indigo-500/30' },
    { label: 'Add Guardian', icon: Plus, to: '/guardians', color: 'bg-pink-600 hover:bg-pink-500', shadow: 'shadow-pink-500/30' },
  ]

  return (
    <AppLayout>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-20"
      >
      {/* ── Risk level banner ──────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className={`rounded-2xl border p-4 bg-gradient-to-r ${riskConfig.color} ${riskConfig.border} flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${riskConfig.dot} animate-pulse`} />
          <span className={`text-sm font-bold ${riskConfig.text}`}>{riskConfig.label}</span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskConfig.badge}`}>
          Score: {safetyScore}/100
        </span>
      </motion.div>

      {/* ── Welcome banner + Safety Score ─────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #1A1A2E 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-purple-300 text-sm font-semibold mb-1"
            >
              {greeting} 👋
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3"
            >
              Welcome, {firstName}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm mb-5 max-w-sm"
            >
              Your SURAKSHA dashboard is active and monitoring. Stay aware, stay safe. 💜
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-slate-900 dark:text-white text-xs font-semibold">{activeGuardians} Active Guardians</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <Clock className="w-4 h-4 text-purple-300" />
                <span className="text-slate-900 dark:text-white text-xs font-semibold">Last seen: Just now</span>
              </div>
            </motion.div>
          </div>

          {/* Safety Score Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex-shrink-0"
          >
            <SafetyScoreRing score={safetyScore} size={180} strokeWidth={14} label="Safety Score" animate />
          </motion.div>
        </div>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, to, color, shadow }) => (
            <Link key={label} to={to}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`${color} rounded-2xl px-4 py-4 flex flex-col items-center gap-2.5 cursor-pointer shadow-xl ${shadow} transition-all`}
              >
                <Icon className="w-6 h-6 text-slate-900 dark:text-white" />
                <span className="text-slate-900 dark:text-white text-xs font-bold text-center">{label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Metric cards ──────────────────────────────────────── */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Navigation, title: 'Active Journeys', value: activeJourneys, trend: 'up', trendValue: 12, gradient: 'purple', subtitle: 'Today' },
          { icon: AlertOctagon, title: 'SOS This Month', value: sosThisMonth, trend: 'down', trendValue: 8, gradient: 'red', subtitle: 'All resolved' },
          { icon: FileWarning, title: 'Open Incidents', value: openIncidents, trend: 'down', trendValue: 15, gradient: 'orange', subtitle: `${MOCK_INCIDENTS.length} total` },
          { icon: Users, title: 'My Guardians', value: activeGuardians, trend: 'up', trendValue: 33, gradient: 'green', subtitle: '1 pending' },
        ].map((card) => (
          <motion.div key={card.title} variants={fadeUp}>
            <MetricCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts + Activity ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety score chart */}
        <motion.div
          variants={fadeUp}
          className="lg:col-span-2 bg-[#1A1A2E] border border-purple-900/20 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Safety Score Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-semibold">+5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,181,253,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="safetyScore"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4, stroke: '#1A1A2E' }}
                activeDot={{ r: 6, fill: '#C4B5FD', stroke: '#7C3AED', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Guardian status */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1A1A2E] border border-purple-900/20 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Guardians</h3>
            <Link to="/guardians" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_GUARDIANS.slice(0, 4).map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${generateAvatarColor(g.name)} flex items-center justify-center text-slate-900 dark:text-white text-sm font-bold flex-shrink-0`}>
                  {getInitials(g.name)}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1A1A2E] ${g.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.relation}</p>
                </div>
                <StatusBadge status={g.status === 'pending' ? 'pending' : g.isOnline ? 'online' : 'offline'} size="xs" dot />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Activity + Recommendations ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1A1A2E] border border-purple-900/20 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-white/5 flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-tight">{item.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(item.time)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1A1A2E] border border-purple-900/20 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> AI Recommendations
            </h3>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
              Personalized
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_RECOMMENDATIONS.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-all group"
              >
                <div className={`p-2 rounded-lg bg-white/5 flex-shrink-0 ${rec.color}`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 leading-tight">{rec.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.description}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${
                  rec.priority === 'high' ? 'bg-red-400' : rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Journeys ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-[#1A1A2E] border border-purple-900/20 rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" /> Recent Journeys
          </h3>
          <Link to="/journey" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {MOCK_JOURNEYS.slice(0, 4).map((journey, i) => (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                journey.status === 'active' ? 'bg-green-500/15 text-green-400' :
                journey.riskLevel === 'high' ? 'bg-orange-500/15 text-orange-400' :
                'bg-purple-500/15 text-purple-400'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 font-medium truncate">
                  {journey.source} → {journey.destination}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{journey.travelMode} · {formatRelativeTime(journey.startedAt)}</p>
              </div>
              <StatusBadge status={journey.status} size="xs" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  </AppLayout>
  )
}

export default Dashboard
