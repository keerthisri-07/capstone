import React from 'react'

const STATUS_MAP = {
  active: { label: 'Active', classes: 'bg-green-400/15 text-green-400 border-green-400/30' },
  completed: { label: 'Completed', classes: 'bg-blue-400/15 text-blue-400 border-blue-400/30' },
  pending: { label: 'Pending', classes: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' },
  open: { label: 'Open', classes: 'bg-orange-400/15 text-orange-400 border-orange-400/30' },
  under_review: { label: 'Under Review', classes: 'bg-purple-400/15 text-purple-400 border-purple-400/30' },
  resolved: { label: 'Resolved', classes: 'bg-green-400/15 text-green-400 border-green-400/30' },
  closed: { label: 'Closed', classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30' },
  emergency: { label: 'Emergency', classes: 'bg-red-400/15 text-red-500 border-red-400/30' },
  inactive: { label: 'Inactive', classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30' },
  online: { label: 'Online', classes: 'bg-green-400/15 text-green-400 border-green-400/30' },
  offline: { label: 'Offline', classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30' },
  low: { label: 'Low', classes: 'bg-green-400/15 text-green-400 border-green-400/30' },
  medium: { label: 'Medium', classes: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30' },
  high: { label: 'High', classes: 'bg-orange-400/15 text-orange-400 border-orange-400/30' },
  critical: { label: 'Critical', classes: 'bg-red-400/15 text-red-400 border-red-400/30' },
  user: { label: 'User', classes: 'bg-indigo-400/15 text-indigo-400 border-indigo-400/30' },
  guardian: { label: 'Guardian', classes: 'bg-blue-400/15 text-blue-400 border-blue-400/30' },
  admin: { label: 'Admin', classes: 'bg-purple-400/15 text-purple-400 border-purple-400/30' },
}

const StatusBadge = ({ status, label, dot = true, size = 'sm', className = '' }) => {
  const key = status?.toLowerCase?.() || 'active'
  const config = STATUS_MAP[key] || {
    label: status || 'Unknown',
    classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30',
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.classes} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.classes.split(' ')[1].replace('text-', 'bg-')}`} />
      )}
      {label || config.label}
    </span>
  )
}

export default StatusBadge
