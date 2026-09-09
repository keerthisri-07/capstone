import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Zap, MapPin, Bell, Users, BarChart2, FileText, ArrowRight,
  Star, ChevronDown, Bot, Radio, WifiOff, FileCheck, CheckCircle2,
  Share2, Globe, Cpu, Server, Database, Smartphone, GitBranch
} from 'lucide-react'

const CORE_MODULES = [
  {
    module: 'AI Assistance Module',
    features: 'AI Safety Assistant, Multilingual Support, Speech Recognition',
    desc: 'Enables users to interact with the application through voice or text in multiple languages. The AI assistant provides safety guidance and responds to emergency-related queries.',
    icon: Bot,
    color: 'from-violet-500 to-purple-600',
    tags: ['Multilingual', 'Speech-to-Text', 'TTS Audio']
  },
  {
    module: 'Emergency Response Module',
    features: 'Manual SOS, Voice SOS, Offline & Online SOS',
    desc: 'Allows users to trigger emergency alerts manually or using a custom voice keyword. The system sends SMS alerts when offline and live location updates when online.',
    icon: Bell,
    color: 'from-red-500 to-rose-600',
    tags: ['5s Abort Window', 'Keyword Spotting', 'Offline SMS']
  },
  {
    module: 'Trust Circle Module',
    features: 'Trust Circle, Guardian Dashboard, Secure Tracking Link',
    desc: 'Allows users to add trusted contacts who receive emergency alerts, live location updates, and can monitor the user’s safety through a secure dashboard or tracking link.',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    tags: ['Guardian Dashboard', 'Public Tracking Link', 'WhatsApp Sync']
  },
  {
    module: 'Journey Monitoring Module',
    features: 'Journey Mode, Live Location Tracking, Safe Arrival Confirmation',
    desc: 'Tracks the user’s journey in real time, shares location with trusted contacts, and requests arrival confirmation. If the user does not confirm safety, trusted contacts are notified.',
    icon: MapPin,
    color: 'from-emerald-500 to-teal-600',
    tags: ['Real-time GPS', 'Arrival Countdown', 'Auto-Escalation']
  },
  {
    module: 'Automation Module',
    features: 'n8n Workflow Automation',
    desc: 'Automates emergency actions such as sending SMS, emails, push notifications, and recording incident details, reducing manual intervention during emergencies.',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    tags: ['n8n Engine', 'SMS Webhooks', 'Push Notifications']
  },
  {
    module: 'Reporting Module',
    features: 'AI Incident Report',
    desc: 'Automatically generates a structured incident report containing emergency details such as time, location, and actions performed during the incident.',
    icon: FileText,
    color: 'from-cyan-500 to-blue-600',
    tags: ['AI Reconstruction', 'PDF / RTF Export', 'Legal Timelines']
  },
]

const METHODOLOGY_STEPS = [
  { step: '01', title: 'User Registration', desc: 'Secure profile onboarding' },
  { step: '02', title: 'Language Selection', desc: 'Native tongue preference' },
  { step: '03', title: 'Create Trust Circle', desc: 'Add trusted emergency contacts' },
  { step: '04', title: 'AI Assistant / Journey Mode', desc: 'Active monitoring & voice queries' },
  { step: '05', title: 'Emergency Detected', desc: 'Situation classification engine' },
  { step: '06', title: 'Manual SOS or Voice SOS', desc: 'Keyword or 1-tap activation' },
  { step: '07', title: 'Location Tracking', desc: 'Live GPS stream & Secure Link' },
  { step: '08', title: 'n8n Automation', desc: 'SMS, email & push notification dispatch' },
  { step: '09', title: 'Trust Circle Notified', desc: 'Guardians receive actionable alert' },
]

const stats = [
  { value: '10,000+', label: 'Women Protected' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '<5s', label: 'SOS Alert Time' },
  { value: '7 Languages', label: 'Multilingual AI' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer, Bengaluru', text: 'SURAKSHA gave me confidence to commute alone late at night. My Trust Circle always receives my live tracking link.', rating: 5 },
  { name: 'Anjali Mehta', role: 'Medical Student, Mumbai', text: 'The Voice SOS keyword detection is incredible! I can speak "Help me SURAKSHA" hands-free without even touching my phone.', rating: 5 },
  { name: 'Ritu Agarwal', role: 'Entrepreneur, Delhi', text: 'The Safe Arrival Confirmation ensures that if I ever forget to check in, my family gets notified automatically.', rating: 5 },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F1A] text-slate-900 dark:text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-slate-50 dark:bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">SURAKSHA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
          <a href="#core-modules" className="hover:text-slate-900 dark:text-white transition-colors">6 Core Modules</a>
          <a href="#methodology" className="hover:text-slate-900 dark:text-white transition-colors">Methodology</a>
          <a href="#architecture" className="hover:text-slate-900 dark:text-white transition-colors">Architecture</a>
          <Link to="/about" className="hover:text-slate-900 dark:text-white transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0,40,0], y:[0,-30,0] }} transition={{ duration:10, repeat:Infinity, ease:'easeInOut' }}
            className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
          <motion.div animate={{ x:[0,-30,0], y:[0,40,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut', delay:1 }}
            className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }} className="relative z-10 max-w-4xl mx-auto">
          <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Safe Companion
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Your AI-Powered
            <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Safety Companion
            </span>
          </h1>

          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Live Journey Monitoring with Safe Arrival Confirmation, Hands-free Voice SOS, and Trust Circle coordination — powered by Gemini AI and FastAPI backend.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/track/suraksha-live-session">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 rounded-2xl border border-violet-500/30 text-slate-900 dark:text-white font-semibold text-lg hover:bg-white/[0.04] transition-all flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" /> Live Tracking Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Floating shield */}
        <motion.div
          animate={{ y: [0,-16,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
          className="relative z-10 mt-16 w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center shadow-2xl shadow-violet-500/20"
        >
          <Shield className="w-16 h-16 text-violet-400" />
        </motion.div>

        <motion.a href="#core-modules" animate={{ y:[0,6,0] }} transition={{ duration:2, repeat:Infinity }}
          className="absolute bottom-8 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors flex flex-col items-center gap-1">
          <span className="text-xs">Explore 6 Core Modules</span>
          <ChevronDown className="w-4 h-4" />
        </motion.a>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-y border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }} className="text-center">
              <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Core Modules (Directly from User Architecture Spec) ── */}
      <section id="core-modules" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">
              Architecture Core Specification
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-3 mb-4">
              The 6 Core Modules of SURAKSHA
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Engineered according to the system architecture specification for total safety and instant emergency response.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_MODULES.map((m, i) => (
              <motion.div
                key={m.module}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i*0.08 }}
                whileHover={{ y:-6 }}
                className="p-8 rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] shadow-xl flex flex-col justify-between group hover:border-violet-500/40 transition-all duration-300"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-6 shadow-lg text-white group-hover:scale-105 transition-transform`}>
                    <m.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{m.module}</h3>
                  <p className="text-xs font-semibold text-violet-400 mb-3">{m.features}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{m.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap gap-1.5">
                  {m.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── System Architecture Section ── */}
      <section id="architecture" className="py-24 px-6 bg-white dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div>
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">
              System Engineering
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-3 mb-4">
              Integrated System Architecture
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
              Full-stack safety ecosystem connecting Flutter/Web clients, FastAPI backend, Gemini AI, MongoDB, Firebase, and n8n automations.
            </p>
          </div>

          {/* Interactive Architecture Diagram Visual */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-purple-900/40 text-left shadow-2xl space-y-8">
            {/* Layer 1: App Interface */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Client Layer (Web & Flutter Mobile App)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Bot className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">AI Assistant</p>
                  <p className="text-[11px] text-gray-400">Multilingual & Voice</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <MapPin className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">Journey Module</p>
                  <p className="text-[11px] text-gray-400">Live GPS & Arrival Check</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <Bell className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">SOS Module</p>
                  <p className="text-[11px] text-gray-400">Manual, Voice & Offline</p>
                </div>
              </div>
            </div>

            {/* Down arrow */}
            <div className="flex justify-center -my-2 text-violet-400 font-black text-xl">▼</div>

            {/* Layer 2: FastAPI Backend */}
            <div className="p-4 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-center">
              <Server className="w-6 h-6 text-violet-400 mx-auto mb-1" />
              <h3 className="text-base font-bold text-white">FastAPI Backend</h3>
              <p className="text-xs text-violet-300">Asynchronous API, Routing & Orchestration Engine</p>
            </div>

            {/* Down arrow */}
            <div className="flex justify-center -my-2 text-violet-400 font-black text-xl">▼</div>

            {/* Layer 3: Services & AI */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" /> Databases & Intelligence Layer
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-xs font-bold text-emerald-400">MongoDB</p>
                  <p className="text-[10px] text-gray-400">User, Journeys & SOS</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <p className="text-xs font-bold text-amber-400">Firebase</p>
                  <p className="text-[10px] text-gray-400">Auth & Realtime Sync</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <p className="text-xs font-bold text-purple-400">Gemini AI</p>
                  <p className="text-[10px] text-gray-400">Distress & RAG Agent</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <p className="text-xs font-bold text-blue-400">Google Maps</p>
                  <p className="text-[10px] text-gray-400">Geo & Leaflet Overlays</p>
                </div>
              </div>
            </div>

            {/* Down arrow */}
            <div className="flex justify-center -my-2 text-violet-400 font-black text-xl">▼</div>

            {/* Layer 4: Automations & Trust Circle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                <Zap className="w-5 h-5 text-rose-400 mx-auto" />
                <p className="text-sm font-bold text-rose-400">n8n Automation</p>
                <p className="text-xs text-gray-300">SMS • Email • Push Notification Dispatch</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-2">
                <Users className="w-5 h-5 text-indigo-400 mx-auto" />
                <p className="text-sm font-bold text-indigo-400">Trust Circle</p>
                <p className="text-xs text-gray-300">Guardian Dashboard & Secure Tracking Link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Methodology Process Flow ── */}
      <section id="methodology" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider">
              Process Flow
            </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-3 mb-4">
              Methodology — End-to-End Safety Flow
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
              How SURAKSHA protects users through every phase from onboarding to emergency mitigation.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline connection line */}
            <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-gradient-to-b from-violet-600 via-indigo-600 to-rose-600 hidden sm:block" />

            <div className="space-y-6">
              {METHODOLOGY_STEPS.map((m, i) => (
                <motion.div
                  key={m.step}
                  initial={{ opacity:0, x:-20 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ delay: i*0.06 }}
                  className="flex items-center gap-6 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] shadow-md hover:border-violet-500/30 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 relative z-10">
                    {m.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{m.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-white dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Trusted by Women Across India</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base">Real experiences with SURAKSHA's active safety monitoring.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">{Array.from({length:t.rating}).map((_,j)=><Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.05]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-sm font-bold">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/25 p-12 text-center shadow-2xl">
          <Shield className="w-16 h-16 text-violet-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Start your safety journey today</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-8">Join thousands of women who trust SURAKSHA with their daily commute and peace of mind.</p>
          <Link to="/register">
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
              Create Free Account →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-white/[0.06] text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-violet-500" />
          <span className="font-semibold text-slate-900 dark:text-white">SURAKSHA</span>
        </div>
        <p>© 2026 SURAKSHA Platform. Built with ❤️ for women&apos;s safety.</p>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Terms</a>
          <Link to="/about" className="hover:text-slate-900 dark:text-white transition-colors">About</Link>
          <Link to="/login" className="hover:text-slate-900 dark:text-white transition-colors">Login</Link>
        </div>
      </footer>
    </div>
  )
}
