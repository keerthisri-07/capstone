import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, MapPin, Clock, AlertCircle, Play, Square, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mockJourneys = [
  { id:1, from:'Home, Indiranagar', to:'MG Road Metro', mode:'Walk', status:'completed', time:'2h ago', duration:'22 min', score:92 },
  { id:2, from:'Office, Whitefield', to:'Home',         mode:'Auto', status:'completed', time:'Yesterday', duration:'45 min', score:88 },
  { id:3, from:'Koramangala',        to:'JP Nagar',     mode:'Bus',  status:'completed', time:'2 days ago', duration:'38 min', score:76 },
]

export default function JourneyMonitor() {
  const [source, setSource] = useState('')
  const [dest,   setDest]   = useState('')
  const [mode,   setMode]   = useState('walk')
  const [active, setActive] = useState(false)

  return (
    <AppLayout noPadding>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full">
        
        {/* Left Column (50%): Form + History */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 h-full p-8 overflow-y-auto">
          {/* Header */}
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex-shrink-0">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Journey Monitor</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Start a monitored journey with AI safety tracking</p>
          </motion.div>

          {/* Journey form */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
            className="rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] p-8 space-y-6 flex-shrink-0 shadow-xl dark:shadow-2xl">
            <h2 className="text-xl text-slate-900 dark:text-white font-bold flex items-center gap-3"><Navigation className="w-5 h-5 text-violet-500" /> New Journey</h2>
            <div className="space-y-5">
              <div>
                <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-2 block uppercase tracking-wider">From</label>
                <input value={source} onChange={e=>setSource(e.target.value)} placeholder="Current location or address"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.05] text-slate-900 dark:text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-2 block uppercase tracking-wider">To</label>
                <input value={dest} onChange={e=>setDest(e.target.value)} placeholder="Destination"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.05] text-slate-900 dark:text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-2 block uppercase tracking-wider">Travel Mode</label>
                <div className="grid grid-cols-4 gap-3">
                  {['walk','bus','auto','car'].map(m => (
                    <button key={m} onClick={()=>setMode(m)}
                      className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all ${mode===m ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#13131F]' : 'bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.05] hover:border-violet-500/50'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <motion.button whileTap={{ scale:0.97 }} onClick={() => setActive(!active)}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${active
                  ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500'}`}>
                {active ? <><Square className="w-5 h-5" /> End Journey</> : <><Play className="w-5 h-5" /> Start Journey</>}
              </motion.button>
              
              <AnimatePresence>
                {active && (
                  <motion.div initial={{ opacity:0, height:0, marginTop:0 }} animate={{ opacity:1, height:'auto', marginTop:16 }} exit={{ opacity:0, height:0, marginTop:0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 overflow-hidden">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">AI monitoring active — 12 guardians notified</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Journey history */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] p-6 lg:p-8 flex-1 flex flex-col min-h-0 shadow-xl dark:shadow-2xl">
            <h2 className="text-xl text-slate-900 dark:text-white font-bold mb-6 flex items-center gap-3 flex-shrink-0"><Clock className="w-5 h-5 text-violet-500" /> Recent History</h2>
            <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-1">
              {mockJourneys.map((j,i) => (
                <motion.div key={j.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.35+i*0.07 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05] hover:border-violet-500/40 transition-all group cursor-pointer hover:shadow-md">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-base font-bold truncate">{j.to}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{j.mode} • {j.duration} • {j.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">{j.score}</span>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Score</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (50%): Map */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="w-full lg:w-1/2 bg-white dark:bg-[#13131F] border-l border-slate-200 dark:border-white/[0.08] overflow-hidden relative flex flex-col items-center justify-center h-full shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-slate-100 dark:bg-black/40" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-900/30 dark:to-violet-900/30 pointer-events-none" />
          
          {/* Mock map UI overlay */}
          <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
             <div className="px-5 py-3 bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
               <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">GPS Signal Strong</span>
             </div>
             
             <div className="flex flex-col gap-3 pointer-events-auto">
               <button className="w-12 h-12 bg-white dark:bg-[#13131F] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                 <span className="text-2xl font-light text-slate-600 dark:text-slate-300">+</span>
               </button>
               <button className="w-12 h-12 bg-white dark:bg-[#13131F] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                 <span className="text-2xl font-light text-slate-600 dark:text-slate-300">−</span>
               </button>
             </div>
          </div>

          <div className="text-center z-10 p-10 rounded-3xl bg-white/70 dark:bg-[#13131F]/70 backdrop-blur-xl border border-white/50 dark:border-white/[0.08] shadow-2xl max-w-sm mx-auto">
            <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <MapPin className="w-12 h-12 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-2xl text-slate-900 dark:text-white font-black mb-2">Map Interface</p>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">Enter your destination and start a journey to see real-time AI safety tracking on the map.</p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
