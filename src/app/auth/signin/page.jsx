'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/services/auth'
import toast, { Toaster } from 'react-hot-toast'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address', {
        duration: 4000,
        icon: '✉️',
      })
      setIsLoading(false)
      return
    }

    // Password length validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        duration: 4000,
        icon: '🔑',
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)
      if (result.success) {
        toast.success('Welcome back! Signed in successfully', {
          duration: 3000,
          icon: '👋',
        })
        router.push('/')
      } else {
        // Enhanced error handling with specific messages
        switch (result.error) {
          case 'user-not-found':
            toast.error('Account not found. Please check your email or sign up.', {
              duration: 4000,
              icon: '❌',
            })
            break
          case 'invalid-password':
            toast.error('Incorrect password. Please try again.', {
              duration: 4000,
              icon: '🔒',
            })
            break
          case 'too-many-requests':
            toast.error('Too many attempts. Please try again later.', {
              duration: 5000,
              icon: '⚠️',
            })
            break
          case 'account-disabled':
            toast.error('This account has been disabled. Please contact support.', {
              duration: 5000,
              icon: '🚫',
            })
            break
          default:
            toast.error(result.error || 'Failed to sign in. Please try again.', {
              duration: 4000,
              icon: '❗',
            })
        }
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', {
        duration: 4000,
        icon: '📡',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Matrix-like rain effect */}
      <div className="absolute inset-0 opacity-20" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='matrix' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Ctext x='50%25' y='50%25' fill='%2300ff00' font-family='monospace'%3E01%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23matrix)'/%3E%3C/svg%3E")`,
        animation: 'matrix-rain 20s linear infinite'
      }}></div>

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-gray-900/60 to-gray-900/90 backdrop-blur-sm"></div>

      <Toaster position="top-right" />
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900/80 rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-2xl shadow-cyan-500/20 relative z-10">
        {/* Decorative circuit lines */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-lg"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/20 rounded-br-lg"></div>
        </div>

        <div>
          {/* Terminal-style header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-bold text-cyan-400 font-mono">
              System Access_
            </h2>
            <p className="text-cyan-500/50 font-mono text-sm">
              [Secure Authentication Required]
            </p>
          </div>
        </div>

        {/* Update the form classes */}
        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-cyan-400 font-mono pl-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-cyan-500/50" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 px-3 py-2 border border-cyan-500/30 bg-gray-900/90 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm font-mono transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-cyan-400 font-mono pl-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-cyan-500/50" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 pr-12 px-3 py-2 border border-cyan-500/30 bg-gray-900/90 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 sm:text-sm font-mono transition-colors duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-cyan-500/50 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-cyan-500/50 font-mono pl-1 mt-1">
                Click the eye icon to {showPassword ? 'hide' : 'show'} password
              </p>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 font-mono border-cyan-500/30 disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <Link 
              href="/auth/signup"
              className="font-mono text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200 hover:underline"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>

        <style jsx>{`
          @keyframes matrix-rain {
            0% { background-position: 0 0; }
            100% { background-position: 0 1000px; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  )
} 