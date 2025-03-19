import React from 'react'

export default function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
          Our Platform is under Maintenance
        </h1>
        <p className="text-xl text-gray-400 font-mono">
          We're working on improving our services. Please check back later.
        </p>
      </div>
    </div>
  )
} 