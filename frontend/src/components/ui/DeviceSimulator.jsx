import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

const DeviceSimulator = ({ children }) => {
  const [device, setDevice] = useState('desktop') // desktop, tablet, mobile

  if (device === 'desktop') {
    return (
      <div className="relative min-h-screen w-full">
        {children}
        <Toolbar device={device} setDevice={setDevice} />
      </div>
    )
  }

  const dimensions = {
    mobile: { width: 375, height: 812, borderRadius: 40 },
    tablet: { width: 768, height: 1024, borderRadius: 24 }
  }

  const current = dimensions[device]

  return (
    <div className="min-h-screen w-full bg-slate-200 dark:bg-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden relative transition-colors duration-300">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-[12px] ring-slate-800 dark:ring-black overflow-hidden flex flex-col"
        style={{
          width: current.width,
          height: current.height,
          borderRadius: current.borderRadius,
          maxHeight: 'calc(100vh - 120px)' // Ensure it fits on smaller laptop screens
        }}
      >
        {/* Device Notch for mobile */}
        {device === 'mobile' && (
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-[9999] pointer-events-none">
            <div className="w-40 h-full bg-slate-800 dark:bg-black rounded-b-2xl" />
          </div>
        )}
        
        {/* The app content */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar relative z-0">
          {children}
        </div>
      </motion.div>
      
      <Toolbar device={device} setDevice={setDevice} />
    </div>
  )
}

const Toolbar = ({ device, setDevice }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999]">
    <div className="flex items-center gap-2 p-2 bg-slate-900/80 dark:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
      {[
        { id: 'desktop', icon: Monitor, label: 'Desktop' },
        { id: 'tablet', icon: Tablet, label: 'Tablet' },
        { id: 'mobile', icon: Smartphone, label: 'Mobile' }
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setDevice(id)}
          title={label}
          className={`p-3 rounded-full transition-all ${
            device === id 
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  </div>
)

export default DeviceSimulator
