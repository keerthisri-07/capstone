import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]
                 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white
                 hover:bg-white/[0.07] transition-all duration-200"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  )
}

function AnimatedIcon({ isDark }) {
  return (
    <div className="relative w-4 h-4">
      <motion.span
        key="sun"
        initial={{ opacity: isDark ? 0 : 1, rotate: isDark ? 90 : 0, scale: isDark ? 0 : 1 }}
        animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? 90 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="w-4 h-4 text-amber-400" />
      </motion.span>
      <motion.span
        key="moon"
        initial={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -90, scale: isDark ? 1 : 0 }}
        animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -90, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-4 h-4 text-indigo-300" />
      </motion.span>
    </div>
  )
}
