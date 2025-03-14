'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
            Security Analysis Platform
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-mono">
            Comprehensive security monitoring and threat detection for your digital assets
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* VirusTotal Checker Card */}
          <div 
            onClick={() => router.push('/checker')}
            className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 
                     backdrop-blur-sm shadow-lg hover:border-cyan-500/40 
                     transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-full">
                <svg 
                  className="h-8 w-8 text-cyan-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-cyan-400 font-mono group-hover:text-cyan-300">
                VirusTotal Checker
              </h2>
            </div>
            <p className="text-gray-400 mb-4 font-mono">
              Scan IPs and domains against VirusTotal's extensive threat database. 
              Detect malicious entities and protect your infrastructure.
            </p>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bulk scanning capabilities
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time threat detection
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Detailed threat analysis
              </li>
            </ul>
          </div>

          {/* ATRA Monitoring Card */}
          <div 
            onClick={() => router.push('/monitoring')}
            className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 
                     backdrop-blur-sm shadow-lg hover:border-cyan-500/40 
                     transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-full">
                <svg 
                  className="h-8 w-8 text-cyan-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-cyan-400 font-mono group-hover:text-cyan-300">
                ATRA Monitoring
              </h2>
            </div>
            <p className="text-gray-400 mb-4 font-mono">
              Advanced Threat Response & Analysis monitoring system. 
              Real-time surveillance and threat detection for your network.
            </p>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Real-time monitoring
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced threat analytics
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Automated response system
              </li>
            </ul>
          </div>
        </div>

        

        {/* Footer Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 font-mono text-sm">
            Select a module above to get started with your security analysis
          </p>
        </div>
      </div>
    </div>
  )
}
