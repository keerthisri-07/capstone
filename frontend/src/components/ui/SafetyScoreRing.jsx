import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SafetyScoreRing = ({ score = 0, size = 180, strokeWidth = 14, label = 'Safety Score', animate = true }) => {
  const [displayScore, setDisplayScore] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const dashOffset = circumference - (progress / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10B981', text: 'text-green-400', glow: 'rgba(16,185,129,0.3)' }
    if (s >= 50) return { stroke: '#F59E0B', text: 'text-yellow-400', glow: 'rgba(245,158,11,0.3)' }
    return { stroke: '#EF4444', text: 'text-red-400', glow: 'rgba(239,68,68,0.3)' }
  }

  const colors = getColor(score)

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }
    let start = 0
    const end = score
    const duration = 1500
    const startTime = performance.now()

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [score, animate])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ background: colors.glow }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-black ${colors.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        <p className={`text-xs font-medium mt-0.5 ${colors.text}`}>
          {score >= 80 ? '✓ Excellent' : score >= 50 ? '⚠ Fair' : '⚠ Needs Attention'}
        </p>
      </div>
    </div>
  )
}

export default SafetyScoreRing
