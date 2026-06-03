import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Zap, MapPin, Bell, Users, BarChart2, FileText, ArrowRight, Star, ChevronDown } from 'lucide-react'

const features = [
  { icon: Zap,        title: 'Distress Detection',     desc: 'AI analyzes text and voice to classify distress: Safe, Concern, Warning, or Emergency — in real time.' },
  { icon: MapPin,     title: 'Journey Monitoring',     desc: 'Smart route tracking detects deviations, long stoppages, and abnormal patterns automatically.' },
  { icon: Bell,       title: 'Emergency Response',     desc: 'One-tap SOS alerts all guardians with your GPS location and triggers automated notification workflows.' },
  { icon: Users,      title: 'Guardian Network',       desc: 'Build a trusted circle of family and friends who receive real-time alerts and activity updates.' },
  { icon: FileText,   title: 'Chitti - AI Chatbot',    desc: 'Powered by RAG with a dedicated memory bank of 50+ legal rights, safety laws, and emergency protocols.' },
  { icon: BarChart2,  title: 'Safety Analytics',       desc: 'Personalized safety score, travel heatmaps, risk trends, and AI-powered recommendations.' },
]

const stats = [
  { value: '10,000+', label: 'Women Protected'  },
  { value: '99.9%',   label: 'Platform Uptime'  },
  { value: '<30s',    label: 'Response Time'     },
  { value: '50+',     label: 'Verified RAG Documents'   },
]

const testimonials = [
  { name: 'Priya Sharma',    role: 'Software Engineer, Bengaluru', text: 'SafeHer gave me confidence to commute alone late at night. My family always knows where I am.', rating: 5 },
  { name: 'Anjali Mehta',    role: 'Medical Student, Mumbai',     text: 'The distress detection is incredible. I just described my situation and it immediately alerted my mom.', rating: 5 },
  { name: 'Ritu Agarwal',    role: 'Entrepreneur, Delhi',         text: 'The guardian network feature is a game-changer. My parents feel at peace knowing the AI is watching over me.', rating: 5 },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F1A] text-slate-900 dark:text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-slate-50 dark:bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">SafeHer</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-900 dark:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 dark:text-white transition-colors">How It Works</a>
          <Link to="/about" className="hover:text-slate-900 dark:text-white transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-900 dark:text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20">
        {/* Background blobs */}
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
            AI-Powered Women Safety Platform
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Your AI-Powered
            <span className="block bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Safety Companion
            </span>
          </h1>

          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Proactive journey monitoring, real-time distress detection, and instant emergency response —
            powered by advanced AI agents. You&apos;re never alone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-900 dark:text-white font-semibold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 rounded-2xl border border-white/10 text-slate-900 dark:text-white font-semibold text-lg hover:bg-slate-100 dark:bg-white/[0.04] transition-all">
                Sign In →
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

        <motion.a href="#features" animate={{ y:[0,6,0] }} transition={{ duration:2, repeat:Infinity }}
          className="absolute bottom-8 text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors flex flex-col items-center gap-1">
          <span className="text-xs">Explore Features</span>
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

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to stay safe</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">10 powerful features designed by safety experts, powered by cutting-edge AI</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                whileHover={{ y:-4 }}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How SafeHer works</h2>
          </motion.div>
          <div className="space-y-8">
            {[
              { step:'01', title:'Create Your Account', desc:'Sign up and add your trusted guardians — family, friends, or colleagues who will be notified in emergencies.' },
              { step:'02', title:'Enable AI Monitoring', desc:'Start a journey or simply keep the app active. Our AI agents silently monitor your safety in the background.' },
              { step:'03', title:'Stay Protected 24/7', desc:'If distress is detected or you trigger SOS, guardians are instantly alerted with your location and an AI-generated situation summary.' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.15 }}
                className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-slate-900 dark:text-white font-black text-lg shadow-lg shadow-violet-500/20">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by thousands</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <div className="flex gap-1 mb-4">{Array.from({length:t.rating}).map((_,j)=><Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{t.name}</p>
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
          className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/25 p-12 text-center">
          <Shield className="w-16 h-16 text-violet-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Start your safety journey today</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-8">Join 10,000+ women who trust SafeHer with their safety every day.</p>
          <Link to="/register">
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-900 dark:text-white font-semibold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all">
              Create Free Account →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-white/[0.06] text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-violet-500" />
          <span className="font-semibold text-slate-900 dark:text-white">SafeHer</span>
        </div>
        <p>© 2024 SafeHer AI Platform. Built with ❤️ for women&apos;s safety.</p>
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
