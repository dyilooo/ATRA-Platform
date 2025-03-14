"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { auth } from '@/services/firebase'
import { logOut } from '@/services/auth'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push('/auth/signin')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      const { success, error } = await logOut()
      if (success) {
        // Clear local storage
        localStorage.removeItem('vtApiKey')
        setUser(null)
        router.push('/auth/signin')
        toast.success('Logged out successfully', {
          style: {
            background: '#1e293b',
            color: '#22d3ee',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            fontFamily: 'monospace',
          },
        })
      } else {
        toast.error(error || 'Failed to log out', {
          style: {
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            fontFamily: 'monospace',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    }
  }

  return (
    <nav className="bg-gray-900 border-b border-cyan-500/20">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Navigation Links */}
          <div className="flex space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md font-mono transition-all duration-300 ${
                pathname === '/'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/monitoring"
              className={`px-4 py-2 rounded-md font-mono transition-all duration-300 ${
                pathname === '/monitoring'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
              }`}
            >
              ATRA Monitoring
            </Link>
            <Link
              href="/checker"
              className={`px-4 py-2 rounded-md font-mono transition-all duration-300 ${
                pathname === '/checker'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
              }`}
            >
              VirusTotal Checker
            </Link>
          </div>

          {/* Right side - User Info & Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 font-mono text-sm">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 text-red-300 rounded-md 
                         hover:bg-red-500/30 transition-all duration-300 font-mono
                         border border-red-500/30 text-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 