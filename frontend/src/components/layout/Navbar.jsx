import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Bell, ChevronDown, User, Settings, LogOut,
  Menu, X, Search, Globe
} from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import useAuth from '../../hooks/useAuth'
import { MOCK_NOTIFICATIONS } from '../../utils/mockData'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '../../store/languageStore'

const Navbar = ({ onMenuToggle, isMobileOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)
  const langMenuRef = useRef(null)

  const { language, setLanguage, getLanguageObj } = useLanguageStore()
  const currentLang = getLanguageObj()

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-40 h-16 glass-dark border-b border-purple-900/20"
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-all"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-4.5 h-4.5 text-slate-900 dark:text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-black text-lg gradient-text hidden sm:block">SURAKSHA</span>
          </Link>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>{currentLang.native}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-[#1A1A2E] border border-purple-900/30 rounded-2xl shadow-2xl overflow-hidden py-1 z-50"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setShowLangMenu(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        language === lang.code
                          ? 'bg-violet-600/30 text-violet-300 font-bold'
                          : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-gray-500">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-slate-900 dark:text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[#1A1A2E] border border-purple-900/30 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-purple-400 font-semibold">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-purple-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${notif.color}`}>
                            <div className="w-2 h-2 rounded-full bg-current" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 leading-snug">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.time).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2">
                    <button className="w-full text-xs text-purple-400 hover:text-purple-300 font-semibold py-1 transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-slate-900 dark:text-white text-xs font-black shadow-md">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role || 'user'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A2E] border border-purple-900/30 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-3 border-b border-gray-800 mb-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  {[
                    { icon: User, label: 'Profile', path: '/profile' },
                    { icon: Settings, label: 'Settings', path: '/profile' },
                  ].map(({ icon: Icon, label, path }) => (
                    <Link
                      key={label}
                      to={path}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-slate-900 dark:text-white hover:bg-white/5 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-all w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar
