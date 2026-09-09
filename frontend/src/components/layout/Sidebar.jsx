import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MapPin, AlertOctagon, Bot, FileWarning,
  Users, BarChart3, UserCircle, Shield, ShieldCheck, Settings2
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import SafetyScoreRing from '../ui/SafetyScoreRing'
import { CURRENT_USER } from '../../utils/mockData'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/journey', label: 'Journey Monitor', icon: MapPin },
  { path: '/sos', label: 'SOS Center', icon: AlertOctagon, highlight: true },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/incidents', label: 'Incidents', icon: FileWarning },
  { path: '/guardians', label: 'Trust Circle', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo area (hidden on desktop since navbar has it) */}
      <div className="h-16 flex items-center px-5 border-b border-purple-900/20 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Shield className="w-[18px] h-[18px] text-slate-900 dark:text-white" />
          </div>
          <span className="font-black text-lg gradient-text">SURAKSHA</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon, highlight }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                  : highlight
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-400 rounded-r-full"
                  />
                )}
                <Icon
                  className={`w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0 transition-all ${
                    isActive
                      ? 'text-purple-400'
                      : highlight
                      ? 'text-red-400 group-hover:scale-110'
                      : 'group-hover:scale-110'
                  }`}
                />
                <span className="truncate">{label}</span>
                {highlight && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-gray-800/50 mx-2" />
            <NavLink
              to="/admin"
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              <Settings2 className="w-[18px] h-[18px] flex-shrink-0" />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* User / Safety Score section */}
      <div className="px-3 pb-4 pt-2 border-t border-purple-900/20">
        <div className="rounded-2xl bg-purple-900/20 border border-purple-500/10 p-4 flex flex-col items-center gap-3">
          <SafetyScoreRing score={user?.safetyScore ?? CURRENT_USER.safetyScore ?? 87} size={80} strokeWidth={8} label="" animate />
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium">Your Safety Score</p>
            <div className="flex items-center gap-1 justify-center mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-semibold">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 fixed left-0 top-16 bottom-0 z-30 glass-dark border-r border-purple-900/20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 glass-dark border-r border-purple-900/20 lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
