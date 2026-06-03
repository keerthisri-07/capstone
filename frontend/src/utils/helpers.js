import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { SEVERITY_LEVELS, DISTRESS_CLASSIFICATIONS, CHART_COLORS } from './constants'

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '—'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, formatStr)
  } catch {
    return '—'
  }
}

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'MMM d, yyyy · h:mm a')
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

export const formatDuration = (seconds) => {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export const getSeverityColor = (severity) => {
  const key = severity?.toUpperCase()
  return SEVERITY_LEVELS[key] || SEVERITY_LEVELS.LOW
}

export const getClassificationColor = (classification) => {
  const key = classification?.toLowerCase()
  return DISTRESS_CLASSIFICATIONS[key] || DISTRESS_CLASSIFICATIONS.safe
}

export const truncateText = (text, maxLength = 120) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

export const calculateTravelTime = (distanceKm, mode = 'walking') => {
  const speeds = {
    walking: 5,
    driving: 40,
    bus: 25,
    auto: 30,
  }
  const speed = speeds[mode] || 30
  const hours = distanceKm / speed
  if (hours < 1 / 60) return '< 1 min'
  return formatDuration(Math.round(hours * 3600))
}

export const getSafetyScoreColor = (score) => {
  if (score >= 80) return { text: 'text-green-400', stroke: '#10B981', bg: 'bg-green-400/15' }
  if (score >= 50) return { text: 'text-yellow-400', stroke: '#F59E0B', bg: 'bg-yellow-400/15' }
  return { text: 'text-red-400', stroke: '#EF4444', bg: 'bg-red-400/15' }
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const generateAvatarColor = (name) => {
  const colors = [
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-violet-500 to-purple-600',
  ]
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

export const clsx = (...classes) => classes.filter(Boolean).join(' ')

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
