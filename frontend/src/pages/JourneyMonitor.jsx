import AppLayout from '../components/layout/AppLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Navigation, MapPin, Clock, AlertCircle, Play, Square, ChevronRight,
  ShieldCheck, Share2, Copy, Check, Radio, AlertTriangle, ExternalLink, Battery
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import L from 'leaflet'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const mockJourneys = [
  { id: 1, from: 'Home, Indiranagar', to: 'MG Road Metro', mode: 'Walk', status: 'completed', time: '2h ago', duration: '22 min', score: 92 },
  { id: 2, from: 'Office, Whitefield', to: 'Home', mode: 'Auto', status: 'completed', time: 'Yesterday', duration: '45 min', score: 88 },
  { id: 3, from: 'Koramangala', to: 'JP Nagar', mode: 'Bus', status: 'completed', time: '2 days ago', duration: '38 min', score: 76 },
]

export default function JourneyMonitor() {
  const [source, setSource] = useState('Indiranagar 100ft Road')
  const [dest, setDest] = useState('MG Road Metro Station')
  const [mode, setMode] = useState('auto')
  const [active, setActive] = useState(false)
  const [copied, setCopied] = useState(false)

  // Coordinates
  const startCoords = [12.9784, 77.6408]
  const destCoords = [12.9756, 77.6066]
  const [currentCoords, setCurrentCoords] = useState(startCoords)

  // Safe Arrival Confirmation Modal
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [arrivalCountdown, setArrivalCountdown] = useState(60)

  const trackingUrl = `${window.location.origin}/track/journey-live-session`

  // Countdown timer for safe arrival confirmation
  useEffect(() => {
    let timer
    if (showArrivalModal && arrivalCountdown > 0) {
      timer = setTimeout(() => setArrivalCountdown(c => c - 1), 1000)
    } else if (showArrivalModal && arrivalCountdown === 0) {
      // Auto-escalation if not confirmed
      toast.error('🚨 Safe arrival unconfirmed! Alerting Trust Circle with last location!')
      setShowArrivalModal(false)
      setActive(false)
    }
    return () => clearTimeout(timer)
  }, [showArrivalModal, arrivalCountdown])

  const handleStartJourney = () => {
    if (!dest.trim()) {
      toast.error('Please enter a destination')
      return
    }
    setActive(true)
    toast.success('Journey Mode started. Live tracking active!')
  }

  const handleEndJourneyPrompt = () => {
    // Open Safe Arrival Confirmation dialog
    setArrivalCountdown(60)
    setShowArrivalModal(true)
  }

  const handleConfirmSafety = () => {
    setShowArrivalModal(false)
    setActive(false)
    toast.success('Safe arrival confirmed! Trust Circle notified of your arrival. 🎉')
  }

  const handleTriggerEmergencyFromArrival = () => {
    setShowArrivalModal(false)
    setActive(false)
    toast.error('🚨 Emergency broadcast initiated to your Trust Circle!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl)
    setCopied(true)
    toast.success('Secure tracking link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛡️ I've started a journey on SURAKSHA from ${source} to ${dest}.\nFollow my live location here: ${trackingUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <AppLayout noPadding>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full">
        {/* Left Column: Controls & Journey Setup */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 h-full p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-7 h-7 text-violet-500" />
              Journey Monitoring Module
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Live Location Tracking, Secure Tracking Link & Safe Arrival Confirmation
            </p>
          </motion.div>

          {/* Active Journey Card */}
          {active ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-gradient-to-br from-violet-900/30 via-slate-900 to-black border border-violet-500/40 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Journey Active</span>
                    <p className="text-sm font-bold text-white">{source} ➔ {dest}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
                  {mode.toUpperCase()}
                </span>
              </div>

              {/* Secure Tracking Link Controls */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                    <span>Secure Tracking Link</span>
                  </div>
                  <Link
                    to="/track/journey-live-session"
                    target="_blank"
                    className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                  >
                    View Guardian Page <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all border border-white/10"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* End Journey Button */}
              <button
                onClick={handleEndJourneyPrompt}
                className="w-full py-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Square className="w-5 h-5" /> Arrived / End Journey
              </button>
            </motion.div>
          ) : (
            /* Journey Setup Form */
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] p-6 lg:p-8 space-y-5 shadow-xl"
            >
              <h2 className="text-xl text-slate-900 dark:text-white font-bold flex items-center gap-3">
                <MapPin className="w-5 h-5 text-violet-500" /> New Monitored Journey
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Starting Point</label>
                  <input
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Current location or address"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Destination</label>
                  <input
                    value={dest}
                    onChange={e => setDest(e.target.value)}
                    placeholder="Destination address"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-1.5 block uppercase tracking-wider">Travel Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['walk', 'bus', 'auto', 'car'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          mode === m
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                            : 'bg-slate-100 dark:bg-black/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.05]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartJourney}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                <Play className="w-5 h-5" /> Start Journey Mode
              </button>
            </motion.div>
          )}

          {/* History */}
          <div className="rounded-3xl bg-white dark:bg-[#13131F] border border-slate-200 dark:border-white/[0.08] p-6 flex-1 flex flex-col min-h-0 shadow-lg">
            <h2 className="text-lg text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" /> Recent Journeys
            </h2>
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {mockJourneys.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.05]"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-bold truncate">{j.to}</p>
                    <p className="text-slate-500 text-xs">{j.mode} • {j.duration} • {j.time}</p>
                  </div>
                  <span className="text-emerald-500 text-sm font-black">{j.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map View */}
        <div className="w-full lg:w-1/2 relative h-[450px] lg:h-auto min-h-[400px]">
          <MapContainer
            center={currentCoords}
            zoom={13}
            className="w-full h-full z-0"
            style={{ minHeight: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User marker */}
            <Marker position={currentCoords}>
              <Popup>
                <div className="text-xs">
                  <strong>Current Location</strong>
                  <br />
                  {source}
                  <br />
                  Status: {active ? 'Monitored' : 'Idle'}
                </div>
              </Popup>
            </Marker>
            <Circle
              center={currentCoords}
              radius={250}
              pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.2 }}
            />

            {/* Destination marker */}
            <Marker position={destCoords}>
              <Popup>
                <div className="text-xs">
                  <strong>Destination</strong>
                  <br />
                  {dest}
                </div>
              </Popup>
            </Marker>

            {/* Route polyline */}
            <Polyline
              positions={[startCoords, destCoords]}
              pathOptions={{ color: '#8b5cf6', weight: 4, dashArray: '6, 8' }}
            />
          </MapContainer>

          {/* Floating Live Tracker Overlay */}
          <div className="absolute top-4 right-4 z-[400] bg-black/75 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 text-white flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold">GPS Live Tracking</span>
              <span className="text-gray-400 block text-[10px]">{active ? 'Transmitting to Trust Circle' : 'Ready'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safe Arrival Confirmation Modal */}
      <AnimatePresence>
        {showArrivalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#13131F] border-2 border-emerald-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Safe Arrival Confirmation</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Have you safely reached your destination?
                </p>
              </div>

              {/* Countdown */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <p className="text-xs font-semibold uppercase tracking-wider">Auto-escalation in</p>
                <p className="text-3xl font-black mt-0.5">{arrivalCountdown}s</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  If you do not confirm within 60s, an automatic alert is dispatched to your Trust Circle.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleConfirmSafety}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Yes, I Have Arrived Safely
                </button>

                <button
                  onClick={handleTriggerEmergencyFromArrival}
                  className="w-full py-3 rounded-2xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> I Need Help / Not Safe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
