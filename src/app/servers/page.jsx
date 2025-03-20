'use client'

import StellarServers from '@/components/StellarServers'
import { Toaster } from 'react-hot-toast'

export default function ServersPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
          Stellar Servers
        </h1>
        <StellarServers />
      </div>
    </div>
  )
} 