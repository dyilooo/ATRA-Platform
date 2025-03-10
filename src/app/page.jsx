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
  const [scanHistory, setScanHistory] = useState([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [hasScanned, setHasScanned] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [showGuide, setShowGuide] = useState(true)

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
    if (!apiKey || apiKey.trim() === '') {
      setShowApiKeyModal(true)
      return
    }

    // Check if this is a different API key than the previously saved one
    const previousApiKey = localStorage.getItem('vtApiKey')
    if (previousApiKey !== apiKey) {
      // Reset the API usage counter for new API key
      setApiUsage(0)
      localStorage.setItem('vtApiUsage', '0')
    }

    // Save the new API key
    localStorage.setItem('vtApiKey', apiKey)
    toast.success('API Key saved successfully!', {
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

    if (apiUsage >= API_LIMIT) {
      alert('API daily limit reached. Please use a new API key.')
      return
    }

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      const entries = e.target.result.split('\n').filter(entry => entry.trim())
      setProgress({ current: 0, total: entries.length })
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

        setProgress(prev => ({
          ...prev,
          current: prev.current + 1
        }))
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

  // Add modal component for detailed view
  const DetailedView = ({ result }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
        <h3 className="text-xl font-mono text-cyan-400 mb-4">Detailed Analysis</h3>
        {/* Add detailed threat information */}
        <div className="space-y-4">
          <div className="bg-gray-700/30 p-3 rounded-md">
            <h4 className="text-cyan-300 font-mono">Threat Categories</h4>
            {/* Add threat categories */}
          </div>
          <div className="bg-gray-700/30 p-3 rounded-md">
            <h4 className="text-cyan-300 font-mono">Detection Timeline</h4>
            {/* Add detection timeline */}
          </div>
        </div>
      </div>
    </div>
  )

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

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <Toaster position="top-right" />
      {showApiKeyModal && <ApiKeyModal />}
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
          VirusTotal Threat Scanner
        </h1>

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
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  1
                </span>
                <p className="font-mono text-sm">
                  Enter your <span className="text-cyan-400">VirusTotal API key</span> and click "Save Key". 
                  Don't have one? <a href="https://www.virustotal.com/gui/join-us" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Get it here</a>.
                </p>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  2
                </span>
                <p className="font-mono text-sm">
                  Select your scan type: <span className="text-cyan-400">IP addresses</span> or <span className="text-cyan-400">Domains</span>. 
                  This determines how the scanner will process your input.
                </p>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  3
                </span>
                <p className="font-mono text-sm">
                  Upload a <span className="text-cyan-400">.txt file</span> containing your IPs/domains (one per line). 
                  Maximum <span className="text-cyan-400">500 entries</span> per day due to API limits.
                </p>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono">
                  4
                </span>
                <p className="font-mono text-sm">
                  Click <span className="text-cyan-400">"Start Scanning"</span> to begin the analysis. 
                  Results will show below with options to copy malicious entries.
                </p>
              </div>

              <div className="mt-4 p-3 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                <p className="text-sm font-mono text-cyan-300 flex items-center gap-2">
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
                  Monitor your API usage counter to avoid hitting the daily limit. The counter resets daily.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Scan History */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-cyan-400 font-mono flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              <path fillRule="evenodd" d="M3 8h12v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
            </svg>
            Recent Scans
          </h2>
          <div className="space-y-2">
            {scanHistory.map((scan, index) => (
              <div key={index} className="p-2 bg-gray-700/30 rounded-md text-sm font-mono">
                <span className="text-cyan-400">{scan.date}</span>
                <span className="mx-2">•</span>
                <span>{scan.type === 'ip' ? 'IP Scan' : 'Domain Scan'}</span>
                <span className="mx-2">•</span>
                <span className="text-red-400">{scan.maliciousCount} threats found</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="mt-4">
          <h3 className="text-lg font-mono text-cyan-400 mb-2">Usage Analytics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700/30 p-3 rounded-md">
              <div className="text-2xl font-mono text-cyan-300">{apiUsage}</div>
              <div className="text-sm text-gray-400">Queries Today</div>
            </div>
            <div className="bg-gray-700/30 p-3 rounded-md">
              <div className="text-2xl font-mono text-cyan-300">{API_LIMIT - apiUsage}</div>
              <div className="text-sm text-gray-400">Remaining</div>
            </div>
            <div className="bg-gray-700/30 p-3 rounded-md">
              <div className="text-2xl font-mono text-cyan-300">{results.length}</div>
              <div className="text-sm text-gray-400">Threats Found</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
