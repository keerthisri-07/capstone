import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MetricCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendValue,
  subtitle,
  gradient = 'purple',
  onClick,
  className = '',
}) => {
  const gradients = {
    purple: 'from-purple-600/20 to-indigo-600/10',
    red: 'from-red-500/20 to-rose-600/10',
    green: 'from-green-500/20 to-emerald-600/10',
    blue: 'from-blue-500/20 to-cyan-600/10',
    orange: 'from-orange-500/20 to-amber-600/10',
    pink: 'from-pink-500/20 to-rose-600/10',
  }

  const iconBg = {
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400',
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(91,33,182,0.2)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-purple-500/10 dark:border-purple-900/30 bg-white dark:bg-[#1A1A2E] p-5 cursor-pointer transition-all ${className}`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient]} pointer-events-none`} />

      <div className="relative flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg[gradient]}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div className="relative mt-3">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          {value}
        </motion.p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

export default MetricCard
