'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/services/firebase'

export default function Home() {
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

  return (
    <div className="flex-1 overflow-auto bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent font-mono">
            Security Analysis Platform
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-mono">
            Comprehensive security monitoring and threat detection for our tenants
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dashboard Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Dashboard</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Comprehensive overview of security metrics and alerts.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time Metrics
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Alert Overview
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  System Status
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                View dashboard
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Statistics</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Comprehensive analytics and statistical reporting tools.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time Analytics
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Trend Analysis
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Performance Metrics
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/statistics')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                View statistics
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* ATRA Monitoring Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">ATRA Monitoring</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Advanced threat monitoring and analysis system with real-time alerts.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SOC Monitoring Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Blocked IPs and DNS
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ATIP Consolidated Reports
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
            onClick={() => router.push('/monitoring')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                Learn more
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Database Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Database</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Centralized security data management system.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Data Management
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Query Tools
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Backup Systems
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/database')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                Access database
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Team</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Team management and collaboration tools.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Member Directory
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Role Management
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  </svg>
                  Team Analytics
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/team')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                View team
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Attendance</h2>
              </div>
              <p className="text-gray-400 mb-4 font-mono">Track and manage team attendance records.</p>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Time Tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Shift Management
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Attendance Reports
                </li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/attendance')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                View attendance
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">Notifications</h2>
            </div>
              <p className="text-gray-400 mb-4 font-mono">System alerts and notification management.</p>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  Alert Center
              </li>
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  Notification Settings
              </li>
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  Alert History
              </li>
            </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/notifications')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                View notifications
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* VirusTotal Checker Card */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
            <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18S13.168 18.477 12 19.253" />
                </svg>
              </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono">VirusTotal Checker</h2>
            </div>
              <p className="text-gray-400 mb-4 font-mono">Scan files and URLs for viruses and malware using VirusTotal.</p>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  File Scanning
              </li>
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  URL Scanning
              </li>
              <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                  Scan History
              </li>
            </ul>
            </div>
            <div className="px-6 py-4 bg-gray-800/50 border-t border-cyan-500/20">
              <button 
                onClick={() => router.push('/virustotal')}
                className="text-yellow-400 hover:text-yellow-300 font-mono text-sm flex items-center"
              >
                Scan files and URLs
                <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
