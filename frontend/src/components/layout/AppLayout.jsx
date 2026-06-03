import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import SOSButton from '../ui/SOSButton'

const AppLayout = ({ children, noPadding = false, isFluid = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F0F1A] text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar
        onMenuToggle={() => setMobileOpen((v) => !v)}
        isMobileOpen={mobileOpen}
      />
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main className="lg:ml-56 pt-16 min-h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex-1 w-full ${noPadding ? 'flex flex-col' : 'p-6 lg:p-8'}`}
        >
          {children}
        </motion.div>
      </main>

      <SOSButton />
    </div>
  )
}

export default AppLayout
