'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { 
  storeApiKey, 
  getApiKeyUsage, 
  incrementApiKeyUsage, 
  listenToApiKeyUsage,
  getUserApiKeys,
  resetApiKeyUsage
} from '../services/management'
import { auth } from '@/services/firebase'
import { useRouter } from 'next/navigation'
import ApiKeyManager from '@/components/ApiKeyManager'
import { logOut } from '@/services/auth'
import moment from 'moment-timezone'

export default function VirusTotalChecker() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [inputType, setInputType] = useState('ip') // 'ip' or 'domain'
  const [file, setFile] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiUsage, setApiUsage] = useState(0)
  const API_LIMIT = 500
  const [scanHistory, setScanHistory] = useState([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [hasScanned, setHasScanned] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [nextResetTime, setNextResetTime] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [hasReset, setHasReset] = useState(false)
  const [canReset, setCanReset] = useState(false)

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

  useEffect(() => {
    if (apiUsage >= 490) {
      handleApiKeyRotation()
    }
  }, [apiUsage])

  const handleApiKeyRotation = async () => {
    if (!user) return

    try {
      const keys = await getUserApiKeys(user.uid)
      // First try to find a key with usage below 300
      let availableKey = keys.find(key => key.dailyUsage < 300)
      
      // If no key below 300 is found and current usage is over 300,
      // find any key with usage below 490 (including current key)
      if (!availableKey && apiUsage >= 300) {
        availableKey = keys.find(key => key.dailyUsage < 490)
      }
      
      if (availableKey) {
        setApiKey(availableKey.key)
        if (availableKey.dailyUsage < 300) {
          toast.success('Switched to a recommended API key with low usage')
        } else {
          toast.warning('Switched to an API key with moderate usage', {
            style: {
              background: '#1e293b',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              fontFamily: 'monospace',
            },
          })
        }
      } else {
        toast.error('No available API keys found. Please add a new one.')
      }
    } catch (error) {
      console.error('Error rotating API key:', error)
    }
  }

  useEffect(() => {
    const initializeApiKey = async () => {
      if (!user) return

      const savedApiKey = localStorage.getItem('vtApiKey')
      if (savedApiKey) {
        setApiKey(savedApiKey)
        // Initialize API key in Firebase if it doesn't exist
        await storeApiKey(savedApiKey, user.uid)
        
        // Check and reset daily usage if needed
        checkAndResetDailyUsage(savedApiKey)
        
        // Set up real-time listener for API usage
        const unsubscribe = listenToApiKeyUsage(savedApiKey, (usage) => {
          setApiUsage(usage)
        })

        // Cleanup listener on unmount
        return () => unsubscribe()
      }
    }

    initializeApiKey()
  }, [user])

  // Add this new function to handle daily reset
  const checkAndResetDailyUsage = async (apiKey) => {
    try {
      const lastReset = localStorage.getItem(`lastReset_${apiKey}`)
      const today = new Date().toDateString()

      if (lastReset !== today) {
        // Reset the usage count in Firebase
        await resetApiKeyUsage(apiKey)
        // Update the last reset date
        localStorage.setItem(`lastReset_${apiKey}`, today)
      }
    } catch (error) {
      console.error('Error checking/resetting daily usage:', error)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      setHasScanned(false)
      setResults([])
      setProgress({ current: 0, total: 0 })
    }
  }

  const checkEntries = async () => {
    if (!apiKey || apiKey.trim() === '') {
      setShowApiKeyModal(true)
      return
    }

    if (!file) {
      alert('Please select a file')
      return
    }

    // Check current API usage before starting
    const currentUsage = await getApiKeyUsage(apiKey)
    if (currentUsage >= API_LIMIT) {
      toast.error('API daily limit reached. Please try again tomorrow or use a different API key.', {
        style: {
          background: '#1e293b',
          color: '#f87171',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          fontFamily: 'monospace',
        },
        duration: 5000,
      })
      return
    }

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const entries = e.target.result.split('\n').filter(entry => entry.trim())
      
      // Check if remaining API calls are sufficient
      if (entries.length > (API_LIMIT - currentUsage)) {
        toast.error(`Not enough API calls remaining. You have ${API_LIMIT - currentUsage} calls left but need ${entries.length}`, {
          style: {
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            fontFamily: 'monospace',
          },
          duration: 5000,
        })
        setIsLoading(false)
        return
      }

      setProgress({ current: 0, total: entries.length })
      const results = []
      
      for (const entry of entries) {
        // Double-check usage before each API call
        const usage = await getApiKeyUsage(apiKey)
        if (usage >= API_LIMIT) {
          toast.error('API limit reached during scanning. Stopping...', {
            style: {
              background: '#1e293b',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              fontFamily: 'monospace',
            },
          })
          break
        }

        try {
          const response = await fetch(`/api/check-${inputType}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey,
              entry: entry.trim()
            })
          })

          const data = await response.json()
          
          if (data.malicious > 0) {
            results.push({
              entry: entry.trim(),
              malicious: data.malicious
            })
          }

          // Increment API usage in Firebase
          await incrementApiKeyUsage(apiKey)

        } catch (error) {
          console.error(`Error checking ${entry}:`, error)
        }

        setProgress(prev => ({
          ...prev,
          current: prev.current + 1
        }))
      }

      setResults(results)
      setHasScanned(true)
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!', {
        style: {
          background: '#1e293b',
          color: '#22d3ee',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          fontFamily: 'monospace',
        },
        iconTheme: {
          primary: '#22d3ee',
          secondary: '#1e293b',
        },
      })
    } catch (err) {
      toast.error('Failed to copy', {
        style: {
          background: '#1e293b',
          color: '#f87171',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          fontFamily: 'monospace',
        },
      })
    }
  }

  const exportResults = (format) => {
    const timestamp = new Date().toISOString().split('T')[0]
    let content

    switch(format) {
      case 'csv':
        content = 'Entry,Malicious Detections\n' + 
          results.map(r => `${r.entry},${r.malicious}`).join('\n')
        return new Blob([content], { type: 'text/csv' })
      case 'json':
        content = JSON.stringify(results, null, 2)
        return new Blob([content], { type: 'application/json' })
      default:
        content = results.map(r => `${r.entry} - ${r.malicious} detections`).join('\n')
        return new Blob([content], { type: 'text/plain' })
    }
  }


  const ApiKeyModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-red-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h3 className="text-xl font-mono text-red-400">API Key Required</h3>
        </div>
        <p className="text-gray-300 font-mono text-sm mb-6">
          Please enter your VirusTotal API key to proceed. You can get one by signing up at VirusTotal.
        </p>
        <div className="flex justify-end gap-3">
          <a
            href="https://www.virustotal.com/gui/join-us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                     hover:bg-cyan-500/30 transition-all duration-300 font-mono
                     border border-cyan-500/30 text-sm"
          >
            Get API Key
          </a>
          <button
            onClick={() => setShowApiKeyModal(false)}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-md 
                     hover:bg-red-500/30 transition-all duration-300 font-mono
                     border border-red-500/30 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  // Add this new component for the welcome banner
  const WelcomeBanner = ({ user }) => (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-cyan-500/20 rounded-full">
          <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-cyan-400 font-mono">Welcome, {user?.email}</h2>
          <p className="text-gray-400 text-sm mt-1">Start scanning your IPs and domains for potential threats</p>
        </div>
      </div>
    </div>
  )

  // Update the ApiUsageDisplay component to include a reset button
  const ApiUsageDisplay = ({ apiUsage, API_LIMIT, progress, isLoading, results, apiKey }) => {
    // If no API key is selected, show all zeros
    const displayUsage = apiKey ? apiUsage : 0
    const displayRemaining = apiKey ? (API_LIMIT - apiUsage) : 0
    const displayResults = apiKey ? results.length : 0

    return (
      <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono text-cyan-400">API Usage Monitor</h3>
          <div className="flex items-center gap-3">
            {/* Add Reset Button */}
            {apiKey && (
              <button
                onClick={async () => {
                  try {
                    await resetApiKeyUsage(apiKey)
                    toast.success('API key usage reset successfully', {
                      style: {
                        background: '#1e293b',
                        color: '#22d3ee',
                        border: '1px solid rgba(34, 211, 238, 0.2)',
                        fontFamily: 'monospace',
                      },
                    })
                  } catch (error) {
                    toast.error('Failed to reset API key usage', {
                      style: {
                        background: '#1e293b',
                        color: '#f87171',
                        border: '1px solid rgba(248, 113, 113, 0.2)',
                        fontFamily: 'monospace',
                      },
                    })
                  }
                }}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md 
                         hover:bg-emerald-500/30 transition-all duration-300 font-mono text-sm
                         border border-emerald-500/30 flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Reset Usage
              </button>
            )}
            <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-mono">
              {displayUsage} / {API_LIMIT}
            </div>
          </div>
        </div>
        
        {/* API Usage Progress */}
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
            <div 
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                displayUsage >= API_LIMIT ? 'bg-red-500' :
                displayUsage >= (API_LIMIT * 0.8) ? 'bg-yellow-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min((displayUsage/API_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-3 rounded-md">
            <div className="text-2xl font-mono text-cyan-300">{displayUsage}</div>
            <div className="text-sm text-gray-400">Queries Today</div>
          </div>
          <div className="bg-gray-700/30 p-3 rounded-md">
            <div className="text-2xl font-mono text-cyan-300">{displayRemaining}</div>
            <div className="text-sm text-gray-400">Remaining</div>
          </div>
          <div className="bg-gray-700/30 p-3 rounded-md">
            <div className="text-2xl font-mono text-cyan-300">{displayResults}</div>
            <div className="text-sm text-gray-400">Threats Found</div>
          </div>
        </div>

        {/* Scanning Progress */}
        {isLoading && progress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm font-mono mb-2">
              <span className="text-cyan-400">Scanning Progress:</span>
              <span className="text-cyan-300">{progress.current} / {progress.total}</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <div 
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min((progress.current/progress.total) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {displayUsage >= (API_LIMIT * 0.8) && displayUsage < API_LIMIT && (
          <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm font-mono">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Approaching daily limit
          </div>
        )}
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      const { success, error } = await logOut()
      if (success) {
        // Clear local storage
        localStorage.removeItem('vtApiKey')
        setApiKey('')
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

  const handleApiKeySelect = async (selectedKey) => {
    setApiKey(selectedKey);
    
    // Get the latest usage for the selected key
    try {
      const usage = await getApiKeyUsage(selectedKey);
      setApiUsage(usage);
      
      // Set up real-time listener for this key
      const unsubscribe = listenToApiKeyUsage(selectedKey, (newUsage) => {
        setApiUsage(newUsage);
      });

      // Clean up previous listener when component unmounts or key changes
      return () => unsubscribe();
    } catch (error) {
      console.error('Error getting API key usage:', error);
    }
  };

  useEffect(() => {
    const checkResetTime = () => {
      const phTime = moment().tz('Asia/Manila')
      const nextMidnight = moment().tz('Asia/Manila').endOf('day')
      
      // Set the next reset time
      setNextResetTime(nextMidnight)
      
      // Calculate time until next reset
      const duration = moment.duration(nextMidnight.diff(phTime))
      const hours = Math.floor(duration.asHours())
      const minutes = Math.floor(duration.minutes())
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
      
      // Check if it's midnight (00:00) in PH time
      if (phTime.hour() === 0 && phTime.minute() === 0) {
        setShowResetModal(true)
        setHasReset(false)
      }
      
      // Show warning modal if approaching midnight and hasn't reset
      if (phTime.hour() === 23 && !hasReset) {
        toast.warning('Please reset your API keys before midnight (PH time)', {
          duration: 10000,
          style: {
            background: '#1e293b',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            fontFamily: 'monospace',
          },
        })
      }
    }

    // Run the check every minute
    const interval = setInterval(checkResetTime, 60000)
    checkResetTime() // Initial check
    
    return () => clearInterval(interval)
  }, [hasReset])

  const ResetModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 border border-yellow-500/20">
        <div className="flex items-center gap-3 mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-yellow-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                      />
                    </svg>
          <h3 className="text-xl font-mono text-yellow-400">API Key Reset Required</h3>
        </div>
        <p className="text-gray-300 font-mono text-sm mb-6">
          It's midnight in PH time. Please reset your API keys for the new day.
        </p>
        <div className="flex justify-end gap-3">
            <button
            onClick={async () => {
              try {
                // Reset all API keys
                const keys = await getUserApiKeys(user.uid)
                for (const key of keys) {
                  await resetApiKeyUsage(key.id)
                }
                setHasReset(true)
                setShowResetModal(false)
                toast.success('API keys reset successfully')
              } catch (error) {
                toast.error('Failed to reset API keys')
              }
            }}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-md 
                     hover:bg-yellow-500/30 transition-all duration-300 font-mono
                     border border-yellow-500/30 text-sm"
          >
            Reset All Keys
            </button>
            <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-md 
                     hover:bg-gray-500/30 transition-all duration-300 font-mono
                     border border-gray-500/30 text-sm"
          >
            Remind Later
          </button>
        </div>
      </div>
    </div>
  )

  const ResetTimer = () => {
    // Check if reset is allowed (after midnight PH time)
    useEffect(() => {
      const checkResetAvailability = () => {
        const phTime = moment().tz('Asia/Manila')
        const lastReset = localStorage.getItem('lastReset')
        const today = phTime.format('YYYY-MM-DD')
        
        // Allow reset if it's a new day and hasn't been reset yet
        setCanReset(lastReset !== today)
      }

      checkResetAvailability()
      const interval = setInterval(checkResetAvailability, 60000) // Check every minute
      
      return () => clearInterval(interval)
    }, [])

    const handleResetAllKeys = async () => {
      try {
        // Get all user's API keys
        const keys = await getUserApiKeys(user.uid)
        
        // Reset each key
        for (const key of keys) {
          await resetApiKeyUsage(key.id)
        }
        
        // Update last reset date
        const phTime = moment().tz('Asia/Manila')
        localStorage.setItem('lastReset', phTime.format('YYYY-MM-DD'))
        
        setHasReset(true)
        setCanReset(false)
        
        toast.success('All API keys have been reset successfully', {
          style: {
            background: '#1e293b',
            color: '#22d3ee',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            fontFamily: 'monospace',
          },
        })
      } catch (error) {
        toast.error('Failed to reset API keys', {
          style: {
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            fontFamily: 'monospace',
          },
        })
      }
    }

    return (
      <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/20 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-gray-400">Next API Reset (PH Time):</span>
          <span className="text-yellow-400 font-mono">
            {nextResetTime ? nextResetTime.format('MMM D, HH:mm:ss') : '--:--:--'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-mono text-gray-400">Time until reset:</span>
          <span className="text-yellow-400 font-mono">{timeUntilReset}</span>
        </div>
        
        {/* Reset Button Section */}
        <div className="mt-4 flex items-center justify-between border-t border-yellow-500/20 pt-4">
          <div className="flex-1">
            {!hasReset && (
              <div className="text-xs text-yellow-400/80 font-mono flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
                {canReset ? 'Reset available - New day started' : 'Wait until midnight to reset'}
              </div>
            )}
          </div>
          <button
            onClick={handleResetAllKeys}
            disabled={!canReset || hasReset}
            className={`ml-4 px-4 py-2 rounded-md font-mono text-sm flex items-center gap-2 transition-all duration-300
              ${canReset && !hasReset
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed'
              }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Reset All Keys
          </button>
        </div>
        
        {hasReset && (
          <div className="mt-2 text-xs text-emerald-400/80 font-mono flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            API keys have been reset for today
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <Toaster position="top-right" />
      {showApiKeyModal && <ApiKeyModal />}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
            VirusTotal Threat Scanner
          </h1>
          
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-md 
                       hover:bg-red-500/30 transition-all duration-300 font-mono
                       border border-red-500/30 text-sm flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>

        {/* Welcome Banner */}
        {user && <WelcomeBanner user={user} />}

        {/* User Guide Toggle Button (when guide is hidden) */}
        {!showGuide && (
          <button
            onClick={() => setShowGuide(true)}
            className="bg-gray-800/50 p-3 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg
                       hover:bg-gray-800/70 transition-all duration-300 text-cyan-400"
            title="Show Quick Start Guide"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}

        {/* User Guide Section */}
        {showGuide && (
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Quick Start Guide
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                title="Close Guide"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  1
                </span>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    Add your <span className="text-cyan-400">VirusTotal API key</span> using the key manager below.
                  </p>
                  <p className="text-xs text-gray-400">
                    Need a key? <a href="https://www.virustotal.com/gui/join-us" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Sign up at VirusTotal</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  2
                </span>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    Choose your scan type: <span className="text-cyan-400">IP addresses</span> or <span className="text-cyan-400">Domains</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Select based on the type of data you want to analyze
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  3
                </span>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    Upload a <span className="text-cyan-400">.txt file</span> with your entries
                  </p>
                  <p className="text-xs text-gray-400">
                    One entry per line, supports both IPv4 addresses and domain names
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  4
                </span>
                <div className="font-mono text-sm space-y-1">
                  <p>
                    Click <span className="text-cyan-400">"Start Scanning"</span> to begin analysis
                  </p>
                  <p className="text-xs text-gray-400">
                    Results will show detected threats with export options
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="p-3 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                  <p className="text-sm font-mono text-cyan-300 flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 flex-shrink-0" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    API Usage Limits
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 font-mono pl-7">
                    <li>• Daily limit: <span className="text-cyan-400">500 queries</span> per API key</li>
                    <li>• Multiple API keys supported for increased capacity</li>
                    <li>• Automatic key rotation when approaching limits</li>
                  </ul>
                </div>

                <div className="p-3 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                  <p className="text-sm font-mono text-cyan-300 flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 flex-shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Pro Tips
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 font-mono pl-7">
                    <li>• Monitor the usage counter to avoid hitting limits</li>
                    <li>• Export results in CSV, JSON, or TXT formats</li>
                    <li>• Use multiple API keys for large scans</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <ApiKeyManager 
            onKeySelect={handleApiKeySelect} 
            currentApiKey={apiKey} 
          />
        </div>

             {/* Enhanced API Usage Display */}
             <ApiUsageDisplay 
               apiUsage={apiUsage} 
               API_LIMIT={API_LIMIT} 
               progress={progress}
               isLoading={isLoading}
               results={results}
               apiKey={apiKey}
             />

        {/* Check Type Selection */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <div className="flex gap-4">
            <button
              onClick={() => setInputType('ip')}
              className={`px-6 py-2 rounded-md font-mono transition-all duration-300 ${
                inputType === 'ip'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'
              }`}
            >
              Check IPs
            </button>
            <button
              onClick={() => setInputType('domain')}
              className={`px-6 py-2 rounded-md font-mono transition-all duration-300 ${
                inputType === 'domain'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'
              }`}
            >
              Check Domains
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <div className="space-y-4">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-cyan-400 font-mono
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border
                file:border-cyan-500/30
                file:text-sm file:font-mono
                file:bg-cyan-500/20 file:text-cyan-300
                hover:file:bg-cyan-500/30
                cursor-pointer"
            />
            <button
              onClick={checkEntries}
              disabled={isLoading || !file || !apiKey}
              className="w-full bg-cyan-500/20 text-cyan-300 px-4 py-3 rounded-md 
                       hover:bg-cyan-500/30 disabled:bg-gray-700/50 disabled:text-gray-500
                       border border-cyan-500/30 transition-all duration-300 font-mono
                       disabled:border-gray-600/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Scanning...
                </span>
              ) : 'Start Scanning'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {hasScanned && progress.current === progress.total && !isLoading && results ? (
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400 font-mono">
                Scan Results:
              </h2>
              {results.length > 0 && (
                <span className="text-sm font-mono text-red-400">
                  {results.length} threats detected
                </span>
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-red-900/20 rounded-md border border-red-500/30 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <span className="font-mono text-red-300">{result.entry}</span>
                      <span className="ml-2 text-red-400 font-mono">
                        ({result.malicious} malicious detections)
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.entry)}
                      className="ml-4 p-2 text-cyan-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 
                               transition-all duration-200 focus:opacity-100 outline-none"
                      title="Copy to clipboard"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-900/20 rounded-md border border-emerald-500/30">
                <div className="flex items-center space-x-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-emerald-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className="font-mono text-emerald-400">
                    Scan complete - No malicious entries detected
                  </span>
                </div>
              </div>
            )}

            {/* Export buttons - only show if scan is complete and there are results */}
            {results.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {/* Export CSV */}
                <button
                  onClick={() => {
                    const blob = exportResults('csv')
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `scan-results-${Date.now()}.csv`
                    a.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                             text-sm font-mono hover:bg-cyan-500/30 transition-all duration-300
                             border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>

                {/* Export JSON */}
                <button
                  onClick={() => {
                    const blob = exportResults('json')
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `scan-results-${Date.now()}.json`
                    a.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                             text-sm font-mono hover:bg-cyan-500/30 transition-all duration-300
                             border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  JSON
                </button>

                {/* Export TXT */}
                <button
                  onClick={() => {
                    const blob = exportResults('txt')
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `scan-results-${Date.now()}.txt`
                    a.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                             text-sm font-mono hover:bg-cyan-500/30 transition-all duration-300
                             border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  TXT
                </button>

                {/* Copy All */}
                <button
                  onClick={() => results.forEach(r => copyToClipboard(r.entry))}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                             text-sm font-mono hover:bg-cyan-500/30 transition-all duration-300
                             border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Copy All
                </button>

                {/* Download Report */}
                <button
                  onClick={() => {
                    // Add your report generation logic here
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                             text-sm font-mono hover:bg-cyan-500/30 transition-all duration-300
                             border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </button>
              </div>
            )}
          </div>
        ) : hasScanned && (isLoading || progress.current !== progress.total) ? (
          // Show loading state while scanning
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-400 font-mono">
                Scanning in Progress:
              </h2>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="font-mono text-cyan-400">
                  {isLoading ? "Scanning entries..." : "Preparing scan results..."}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm font-mono mb-2">
                  <span className="text-cyan-400">Progress:</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current/progress.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {user && <ResetTimer />}
        {showResetModal && <ResetModal />}
      </div>
    </div>
  )
}
