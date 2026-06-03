import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, X, ShieldAlert, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSosStore } from '../../store/sosStore'

export default function SOSButton() {
  const { isSOSActive, activateSOS, deactivateSOS } = useSosStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSOSClick = () => {
    if (isSOSActive) {
      deactivateSOS()
      toast.success('SOS deactivated. Stay safe! 💚')
      return
    }
    setShowConfirm(true)
  }

  const confirmSOS = useCallback(async () => {
    setLoading(true)
    try {
      // Get location
      const position = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      ).catch(() => null)

      const loc = position
        ? { lat: position.coords.latitude, lng: position.coords.longitude, address: 'Current Location' }
        : { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka' }

      activateSOS(loc, 'SOS-' + Date.now())
      setShowConfirm(false)

      toast.error('🚨 SOS Activated! Guardians are being notified.', {
        duration: 6000,
        style: {
          background: '#7f1d1d',
          color: '#fca5a5',
          border: '1px solid #ef4444',
        },
      })
    } catch {
      toast.error('Failed to activate SOS. Try again.')
    } finally {
      setLoading(false)
    }
  }, [activateSOS])

  return (
    <>
      {/* Floating SOS Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Active SOS label */}
        <AnimatePresence>
          {isSOSActive && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{ opacity: 0, x: 20   }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
              />
              SOS Active — Tap to cancel
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSOSClick}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center
                     font-bold text-slate-900 dark:text-white shadow-2xl transition-all duration-300 select-none
                     ${isSOSActive
                       ? 'bg-red-600 shadow-red-500/50'
                       : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40 hover:shadow-red-500/60'}`}
        >
          {/* Pulse rings */}
          {isSOSActive && [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-red-400"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <ShieldAlert className="w-6 h-6" />
          <span className="text-xs font-black leading-none mt-0.5">SOS</span>
        </motion.button>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1,   y: 0  }}
              exit={{ scale: 0.8,    y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl bg-[#13131f] border border-red-500/30 p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 mx-auto mb-5 flex items-center justify-center"
              >
                <ShieldAlert className="w-10 h-10 text-red-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Emergency SOS</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                This will immediately alert all your guardians with your current location
                and send emergency notifications.
              </p>
              <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 text-xs">Location will be captured automatically</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white
                             hover:bg-slate-100 dark:bg-white/[0.04] text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={confirmSOS}
                  disabled={loading}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-slate-900 dark:text-white font-semibold text-sm
                             shadow-lg shadow-red-500/30 hover:shadow-red-500/50
                             disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      Activate SOS
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
