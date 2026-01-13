"use client";

// Author: Sourav Kumar Das
import React from 'react'

type Props = {
  value?: number
  height?: string
  showLabel?: boolean
}

export default function ProgressBar({ value = 0, height = 'h-2', showLabel = false }: Props) {
  const safe = Math.max(0, Math.min(100, Math.round(value || 0)));

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden relative`}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${safe}%`,
            background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #7c3aed 100%)',
            transition: 'width 600ms ease',
            boxShadow: '0 4px 10px rgba(59,130,246,0.12)'
          }}
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.08)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.08)50%,rgba(255,255,255,0.08)75%,transparent 75%,transparent)] bg-[length:20px_20px] pointer-events-none"
          style={{ opacity: 0.6 }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex items-center justify-end text-sm font-medium text-gray-700">
          <span>{safe}%</span>
        </div>
      )}
    </div>
  )
}
