'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function VirusTotalChecker() {
  const [apiKey, setApiKey] = useState('')
  const [inputType, setInputType] = useState('ip') // 'ip' or 'domain'
  const [file, setFile] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiUsage, setApiUsage] = useState(0)
  const API_LIMIT = 500

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('vtApiKey')
    if (savedApiKey) setApiKey(savedApiKey)
    
    // Load API usage from localStorage
    const savedUsage = localStorage.getItem('vtApiUsage')
    if (savedUsage) setApiUsage(parseInt(savedUsage))
  }, [])

  const handleApiKeySubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('vtApiKey', apiKey)
    alert('API Key saved successfully!')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) setFile(file)
  }

  const checkEntries = async () => {
    if (!apiKey) {
      alert('Please enter your VirusTotal API key')
      return
    }

    if (!file) {
      alert('Please select a file')
      return
    }

    if (apiUsage >= API_LIMIT) {
      alert('API daily limit reached. Please use a new API key.')
      return
    }

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const entries = e.target.result.split('\n').filter(entry => entry.trim())
      const results = []
      
      for (const entry of entries) {
        if (apiUsage >= API_LIMIT) {
          alert('API limit reached during scanning. Stopping...')
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

          setApiUsage(prev => {
            const newUsage = prev + 1
            localStorage.setItem('vtApiUsage', newUsage.toString())
            return newUsage
          })

        } catch (error) {
          console.error(`Error checking ${entry}:`, error)
        }
      }

      setResults(results)
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

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
          VirusTotal Threat Scanner
        </h1>

        {/* API Key Section */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 font-mono">
                VirusTotal API Key
              </label>
              <div className="mt-1 flex gap-4">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 rounded-md border border-cyan-500/30 bg-gray-900/90 px-3 py-2 text-cyan-100 font-mono
                            focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  placeholder="Enter your API key"
                />
                <button
                  type="submit"
                  className="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-md hover:bg-cyan-500/30 
                           border border-cyan-500/30 transition-all duration-300 font-mono"
                >
                  Save Key
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Usage Counter */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-center font-mono">
            <span className="text-cyan-400">API Usage Today:</span>
            <span className={`font-bold ${
              apiUsage >= API_LIMIT 
                ? 'text-red-400' 
                : 'text-emerald-400'
            }`}>
              {apiUsage} / {API_LIMIT}
            </span>
          </div>
        </div>

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
        {isLoading ? null : (
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-cyan-400 font-mono">
              Scan Results:
            </h2>
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
            ) : file && !isLoading ? (
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
                    No malicious entries detected in scan
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
