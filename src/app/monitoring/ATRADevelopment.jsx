'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/services/firebase'

export default function ATRADevelopment() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth/signin')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) return null

  const upcomingFeatures = [
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Real-time data visualization and trend analysis for tenant alerts',
      eta: 'Q2 2024'
    },
    {
      title: 'Custom Alert Rules',
      description: 'Create and manage personalized alert rules and thresholds',
      eta: 'In Progress'
    },
    {
      title: 'Integration Hub',
      description: 'Connect with popular third-party tools and services',
      eta: 'Coming Soon'
    },
    {
      title: 'Automated Response Workflows',
      description: 'Set up automated actions based on alert conditions',
      eta: 'Planning'
    }
  ]

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-mono mb-4">
            Under Development
          </h1>
          <p className="text-gray-400 font-mono">
            We're working on exciting new features to enhance your ATRA experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border border-purple-500/20 bg-gray-800/50 
                         hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-mono text-purple-400">
                  {feature.title}
                </h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-mono">
                  {feature.eta}
                </span>
              </div>
              <p className="text-gray-400 font-mono text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Development Status */}
        <div className="mt-12 p-6 rounded-lg border border-purple-500/20 bg-gray-800/50">
          <h2 className="text-xl font-mono text-purple-400 mb-4">
            Development Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
              <span className="text-purple-300 font-mono">2%</span>
            </div>
            <p className="text-gray-400 font-mono text-sm">
              Our team is actively working on these features. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
