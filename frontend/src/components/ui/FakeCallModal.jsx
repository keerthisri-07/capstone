import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, X } from 'lucide-react'

const FakeCallModal = ({ isOpen, onClose, callerName = 'Mom 👩', callerNumber = '+91 98765 43210' }) => {
  const [status, setStatus] = useState('ringing') // ringing | accepted | declined
  const audioCtxRef = useRef(null)
  const oscillatorRef = useRef(null)
  const gainRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (isOpen && status === 'ringing') {
      startRingtone()
      timeoutRef.current = setTimeout(() => {
        handleDecline()
      }, 30000)
    }
    return () => {
      stopRingtone()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isOpen, status])

  const startRingtone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      audioCtxRef.current = new AudioContext()
      const gain = audioCtxRef.current.createGain()
      gain.gain.value = 0.1
      gain.connect(audioCtxRef.current.destination)
      gainRef.current = gain

      const playBeep = (time) => {
        const osc = audioCtxRef.current.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, time)
        osc.frequency.setValueAtTime(1100, time + 0.1)
        osc.connect(gain)
        osc.start(time)
        osc.stop(time + 0.2)
      }

      const scheduleRing = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return
        const t = audioCtxRef.current.currentTime
        playBeep(t)
        playBeep(t + 0.3)
        oscillatorRef.current = setTimeout(scheduleRing, 2000)
      }
      scheduleRing()
    } catch (e) {
      console.warn('Audio context not available:', e)
    }
  }

  const stopRingtone = () => {
    if (oscillatorRef.current) clearTimeout(oscillatorRef.current)
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch {}
      audioCtxRef.current = null
    }
  }

  const handleAccept = () => {
    stopRingtone()
    setStatus('accepted')
    setTimeout(() => {
      handleClose()
    }, 5000)
  }

  const handleDecline = () => {
    stopRingtone()
    setStatus('declined')
    setTimeout(() => {
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    stopRingtone()
    setStatus('ringing')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-80 bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Status bar mockup */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 text-xs text-slate-900 dark:text-white/60">
              <span>SURAKSHA</span>
              {status === 'accepted' && (
                <span className="text-green-400 font-semibold">Connected</span>
              )}
            </div>

            {/* Caller info */}
            <div className="flex flex-col items-center px-6 py-8">
              {/* Avatar with pulse */}
              <div className="relative mb-6">
                {status === 'ringing' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping scale-125" />
                    <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping scale-150 animation-delay-300" />
                  </>
                )}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg">
                  {callerName.includes('👩') ? '👩' : callerName.charAt(0)}
                </div>
              </div>

              <p className="text-slate-900 dark:text-white/60 text-sm mb-1">
                {status === 'ringing' ? 'Incoming call' : status === 'accepted' ? 'Call in progress...' : 'Call ended'}
              </p>
              <h2 className="text-slate-900 dark:text-white text-2xl font-bold mb-1">
                {callerName.replace('👩', '').trim() || callerName}
              </h2>
              <p className="text-slate-900 dark:text-white/50 text-sm">{callerNumber}</p>

              {status === 'accepted' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, delay: i * 0.2, duration: 0.8 }}
                      />
                    ))}
                  </div>
                  <span className="text-green-400 text-sm">Speaking...</span>
                </motion.div>
              )}
            </div>

            {/* Action buttons */}
            {status === 'ringing' && (
              <div className="flex items-center justify-around px-10 pb-10">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecline}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
                  >
                    <PhoneOff className="w-6 h-6 text-slate-900 dark:text-white" />
                  </motion.button>
                  <span className="text-slate-900 dark:text-white/60 text-xs">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAccept}
                    className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse-ring"
                  >
                    <Phone className="w-6 h-6 text-slate-900 dark:text-white" />
                  </motion.button>
                  <span className="text-slate-900 dark:text-white/60 text-xs">Accept</span>
                </div>
              </div>
            )}

            {status === 'accepted' && (
              <div className="flex justify-center pb-10">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecline}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                  >
                    <PhoneOff className="w-6 h-6 text-slate-900 dark:text-white" />
                  </motion.button>
                  <span className="text-slate-900 dark:text-white/60 text-xs">End Call</span>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-900 dark:text-white/40 hover:text-slate-900 dark:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FakeCallModal
