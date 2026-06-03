import React from 'react'

export const CardSkeleton = ({ className = '' }) => (
  <div className={`rounded-2xl bg-gray-100 dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
      <div className="flex-1">
        <div className="h-4 w-24 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50 mb-2" />
        <div className="h-3 w-16 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
      </div>
    </div>
    <div className="h-8 w-20 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50 mb-2" />
    <div className="h-3 w-full rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
  </div>
)

export const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`rounded-2xl bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="h-5 w-32 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              className="h-4 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50"
              style={{ width: `${60 + Math.random() * 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export const ChartSkeleton = ({ className = '' }) => (
  <div className={`rounded-2xl bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-800 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="h-5 w-36 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
      <div className="h-8 w-24 rounded-lg animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
    </div>
    <div className="flex items-end gap-2 h-40">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t animate-shimmer bg-gray-200 dark:bg-gray-700/50"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  </div>
)

export const AvatarSkeleton = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 rounded-full animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
    <div>
      <div className="h-4 w-24 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50 mb-1.5" />
      <div className="h-3 w-16 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
    </div>
  </div>
)

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
)

export const PageSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="h-8 w-48 rounded animate-shimmer bg-gray-200 dark:bg-gray-700/50" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
)

export default {
  Card: CardSkeleton,
  Table: TableSkeleton,
  Chart: ChartSkeleton,
  Avatar: AvatarSkeleton,
  Text: TextSkeleton,
  Page: PageSkeleton,
}
