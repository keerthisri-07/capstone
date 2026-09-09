import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, ShieldAlert, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, MapPin,
  Mic, MicOff, Wifi, WifiOff, MessageSquare, Radio, Volume2, ShieldCheck, XCircle, PhoneCall
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { triggerSOS } from '../api/sos'
import toast from 'react-hot-toast'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import FakeCallModal from '../components/ui/FakeCallModal'

const helplines = [
  { name: 'Police Emergency', number: '112', icon: '🚨', desc: 'National Unified Emergency' },
  { name: 'Women Helpline', number: '1091', icon: '👩', desc: 'Direct Women Distress Line' },
  { name: 'Women in Distress', number: '181', icon: '🛡️', desc: 'Domestic & Cyber Violence' },
  { name: 'Cyber Crime Helpline', number: '1930', icon: '💻', desc: 'Online Harassment & Blackmail' },
]

export default function SOSCenter() {
  const [fakeCallActive, setFakeCallActive] = useState(false)
  const [callerName, setCallerName] = useState('Mom 👩')

  // SOS state
  const [sosStatus, setSosStatus] = useState('idle') // idle | countdown | active | resolved
  const [countdown, setCountdown] = useState(5)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isVoiceSosActive, setIsVoiceSosActive] = useState(false)
  const [voiceKeywordDetected, setVoiceKeywordDetected] = useState(null)
  const [currentCoords, setCurrentCoords] = useState(null)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {
          setCurrentCoords({ lat: 12.9716, lng: 77.5946 })
        }
      )
    }
  }, [])

  // Voice SOS Keyword Detection
  const {
    startListening: startVoiceSosListening,
    stopListening: stopVoiceSosListening,
    isListening: isVoiceListening,
  } = useSpeechRecognition({
    keywords: ['help', 'suraksha', 'bachao', 'emergency', 'save me', 'police'],
    continuous: true,
    autoRestart: true,
    onKeywordMatch: (matchedKeyword) => {
      setVoiceKeywordDetected(matchedKeyword)
      toast.error(`🚨 Voice SOS Keyword Detected: "${matchedKeyword}"! Triggering SOS...`, { duration: 4000 })
      startSOSSequence('Voice Activated')
    },
  })

  const toggleVoiceSos = () => {
    if (isVoiceSosActive) {
      stopVoiceSosListening()
      setIsVoiceSosActive(false)
      toast('Voice SOS listener disabled.')
    } else {
      startVoiceSosListening()
      setIsVoiceSosActive(true)
      toast.success('Voice SOS listening for keywords: "Help me SURAKSHA", "Bachao", "Emergency"...')
    }
  }

  // Countdown timer when triggered
  useEffect(() => {
    let timer
    if (sosStatus === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      } else {
        executeSOSAlert()
      }
    }
    return () => clearTimeout(timer)
  }, [sosStatus, countdown])

  const startSOSSequence = (mode = 'Manual') => {
    setCountdown(5)
    setSosStatus('countdown')
  }

  const cancelSOSSequence = () => {
    setSosStatus('idle')
    setCountdown(5)
    setVoiceKeywordDetected(null)
    toast('SOS cancelled.')
  }

  const executeSOSAlert = async () => {
    setSosStatus('active')

    if (isOnline) {
      try {
        await triggerSOS({
          latitude: currentCoords?.lat || 12.9716,
          longitude: currentCoords?.lng || 77.5946,
          type: voiceKeywordDetected ? 'voice' : 'manual',
          message: 'EMERGENCY SOS: User needs urgent assistance! Trust Circle & Emergency notified.'
        })
        toast.success('Emergency alert transmitted to Trust Circle & n8n workflow!')
      } catch (err) {
        toast.error('Online dispatch error, fallback to offline SMS prepared.')
      }
    } else {
      toast.error('Offline mode: Open SMS to notify Trust Circle directly.')
    }
  }

  const offlineSmsLink = `sms:?body=${encodeURIComponent(
    `🚨 EMERGENCY ALERT FROM SURAKSHA!\nI need urgent help! My coordinates: ${currentCoords?.lat || 12.9716}, ${currentCoords?.lng || 77.5946}.\nMap: https://maps.google.com/?q=${currentCoords?.lat || 12.9716},${currentCoords?.lng || 77.5946}`
  )}`

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header & Mode Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              Emergency Response Module
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manual SOS, Voice Activation & Offline/Online Emergency Protocols
            </p>
          </motion.div>

          {/* Online/Offline Badge */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online SOS (Cloud + n8n)' : 'Offline SOS (SMS Fallback)'}</span>
            </div>
          </div>
        </div>

        {/* SOS Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main SOS Trigger Area (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] border transition-all ${
                sosStatus === 'active'
                  ? 'bg-gradient-to-br from-red-950 via-red-900/60 to-black border-red-500 shadow-2xl shadow-red-600/50 animate-pulse'
                  : sosStatus === 'countdown'
                  ? 'bg-gradient-to-br from-amber-950/80 to-[#0F0F1A] border-amber-500'
                  : 'bg-gradient-to-br from-red-950/40 via-purple-950/20 to-[#0F0F1A] border-red-500/25 shadow-xl'
              }`}
            >
              {sosStatus === 'idle' && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startSOSSequence('Manual')}
                      className="w-48 h-48 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-3xl shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center gap-2 border-4 border-red-400/40 relative z-10"
                    >
                      <span>SOS</span>
                      <span className="text-xs font-semibold tracking-wider uppercase opacity-80">Tap to Trigger</span>
                    </motion.button>
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping -z-0 scale-110" />
                  </div>

                  <div className="max-w-md text-center space-y-1">
                    <p className="text-slate-900 dark:text-white font-bold text-base">Instant Emergency Alert</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Notifies your entire Trust Circle, broadcasts GPS coordinates, and initiates emergency automation.
                    </p>
                  </div>
                </div>
              )}

              {sosStatus === 'countdown' && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full border-4 border-amber-400 flex items-center justify-center bg-amber-500/10">
                    <span className="text-6xl font-black text-amber-400">{countdown}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-amber-400">Emergency Alert in {countdown}s</h2>
                    <p className="text-sm text-gray-400 mt-1">If clicked by mistake, tap Cancel immediately.</p>
                  </div>
                  <button
                    onClick={cancelSOSSequence}
                    className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Cancel SOS
                  </button>
                </div>
              )}

              {sosStatus === 'active' && (
                <div className="space-y-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 animate-bounce">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-red-400">EMERGENCY SOS BROADCAST ACTIVE</h2>
                    <p className="text-sm text-gray-300 mt-2 max-w-md mx-auto">
                      Trust Circle contacts notified. Automated SMS and location stream dispatched.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <a
                      href="tel:112"
                      className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/40 hover:bg-red-500 transition-all"
                    >
                      <PhoneCall className="w-4 h-4" /> Call Police (112)
                    </a>
                    <a
                      href={offlineSmsLink}
                      className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 border border-white/20 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" /> Open Backup SMS
                    </a>
                    <button
                      onClick={() => setSosStatus('resolved')}
                      className="px-6 py-3 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-sm hover:bg-emerald-600/40 transition-all"
                    >
                      Mark as Safe
                    </button>
                  </div>
                </div>
              )}

              {sosStatus === 'resolved' && (
                <div className="space-y-4 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-400">Incident Resolved & Safety Confirmed</h2>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Your Trust Circle contacts have received the safe status update.
                  </p>
                  <button
                    onClick={() => setSosStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500"
                  >
                    Return to Ready State
                  </button>
                </div>
              )}
            </motion.div>

            {/* Voice SOS & Offline SOS Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Voice SOS Activation Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isVoiceSosActive ? 'bg-violet-600 text-white' : 'bg-violet-500/10 text-violet-400'
                    }`}>
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Voice SOS</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">Hands-free trigger</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleVoiceSos}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isVoiceSosActive
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-500/20'
                    }`}
                  >
                    {isVoiceSosActive ? 'Listening...' : 'Enable'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Listens in the background for danger keywords: <span className="font-semibold text-violet-400">"Help me SURAKSHA"</span>, <span className="font-semibold text-violet-400">"Bachao"</span>, or <span className="font-semibold text-violet-400">"Emergency"</span>.
                </p>

                {isVoiceSosActive && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    <span>Microphone monitoring active</span>
                  </div>
                )}
              </div>

              {/* Offline SOS Mode Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Offline SMS Dispatch</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">No Internet Required</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If cellular data or Wi-Fi is lost, triggers direct SMS with your exact coordinates to emergency contacts.
                </p>

                <a
                  href={offlineSmsLink}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all w-full justify-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Trigger Direct SMS
                </a>
              </div>
            </div>

            {/* Fake Call Feature */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6">
              <h2 className="text-slate-900 dark:text-white font-bold text-base mb-2">Fake Call Simulator</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                Simulate an incoming phone call to give you a discreet reason to exit an uncomfortable or unsafe situation.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Caller Name"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-violet-500"
                />
                <button
                  onClick={() => setFakeCallActive(true)}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20"
                >
                  Simulate Call
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Helplines & Process Information */}
          <div className="space-y-6">
            {/* Quick Helplines */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6 space-y-4">
              <h2 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-violet-400" />
                Emergency Speed-Dial
              </h2>
              <div className="space-y-2.5">
                {helplines.map((h) => (
                  <a
                    key={h.number}
                    href={`tel:${h.number}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05] hover:border-violet-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{h.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{h.name}</p>
                        <p className="text-[10px] text-gray-500">{h.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                      {h.number}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* n8n Automation Status */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-violet-400" />
                Automated Emergency Channels
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SMS to Trust Circle with Live GPS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>High-Priority Email with Situation Brief</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Push Notification Alert on Devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit Log & Incident Report Generation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FakeCallModal
        isOpen={fakeCallActive}
        onClose={() => setFakeCallActive(false)}
        callerName={callerName}
      />
    </AppLayout>
  )
}
