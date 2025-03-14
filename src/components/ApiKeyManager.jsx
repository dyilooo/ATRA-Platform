'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/services/firebase'
import { 
  getUserApiKeys, 
  storeApiKey, 
  deleteApiKey,
  getApiKeyDetails 
} from '@/services/management'
import toast from 'react-hot-toast'

export default function ApiKeyManager({ onKeySelect, currentApiKey }) {
  const [apiKeys, setApiKeys] = useState([])
  const [newApiKey, setNewApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddKey, setShowAddKey] = useState(false)
  const [keyDetails, setKeyDetails] = useState(null)

  // Fetch user's API keys
  useEffect(() => {
    const loadApiKeys = async () => {
      if (auth.currentUser) {
        const keys = await getUserApiKeys(auth.currentUser.uid, auth.currentUser.email)
        // Sort keys by usage (ascending) and expiration status
        const sortedKeys = keys.sort((a, b) => {
          if (a.isExpired === b.isExpired) {
            return a.dailyUsage - b.dailyUsage
          }
          return a.isExpired ? 1 : -1
        })
        setApiKeys(sortedKeys)
      }
    }

    loadApiKeys()
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadApiKeys()
      } else {
        setApiKeys([])
      }
    })

    return () => unsubscribe()
  }, [])

  // Load current API key details
  useEffect(() => {
    const loadKeyDetails = async () => {
      if (currentApiKey) {
        const details = await getApiKeyDetails(currentApiKey)
        setKeyDetails(details)
      }
    }
    loadKeyDetails()
  }, [currentApiKey])

  const handleAddKey = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!auth.currentUser) {
        toast.error('Please sign in first')
        return
      }

      // Validate API key format
      if (newApiKey.length < 32) {
        toast.error('Invalid API key format')
        return
      }

      const result = await storeApiKey(newApiKey, auth.currentUser.uid, auth.currentUser.email)
      
      if (result.success) {
        const updatedKeys = await getUserApiKeys(auth.currentUser.uid, auth.currentUser.email)
        setApiKeys(updatedKeys)
        setNewApiKey('')
        setShowAddKey(false)
        toast.success('API key added successfully', {
          style: {
            background: '#1e293b',
            color: '#22d3ee',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            fontFamily: 'monospace',
          },
        })

        // Automatically select the new key if no key is currently selected
        if (!currentApiKey) {
          onKeySelect(newApiKey)
        }
      } else {
        toast.error(result.error, {
          style: {
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            fontFamily: 'monospace',
          },
        })
      }
    } catch (error) {
      toast.error('An unexpected error occurred', {
        style: {
          background: '#1e293b',
          color: '#f87171',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          fontFamily: 'monospace',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKey = async (apiKey) => {
    try {
      await deleteApiKey(apiKey)
      const updatedKeys = await getUserApiKeys(auth.currentUser.uid, auth.currentUser.email)
      setApiKeys(updatedKeys)
      toast.success('API key deleted successfully')
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  const findAvailableKey = () => {
    const availableKey = apiKeys.find(key => key.dailyUsage < 450)
    if (availableKey) {
      onKeySelect(availableKey.key)
      toast.success('Switched to available API key')
    } else {
      toast.error('No available API keys found')
    }
  }

  // Add key details display component
  const KeyDetailsCard = ({ details }) => {
    if (!details) return null

    return (
      <div className="mt-4 p-4 bg-gray-700/30 rounded-md">
        <h4 className="text-cyan-400 font-mono mb-2">Current Key Details:</h4>
        <div className="space-y-2 text-sm font-mono">
          <p className="text-gray-300">
            Added by: <span className="text-cyan-300">{details.userEmail}</span>
          </p>
          <p className="text-gray-300">
            Last Updated: <span className="text-cyan-300">
              {new Date(details.lastReset).toLocaleDateString()}
            </span>
          </p>
          <p className="text-gray-300">
            Status: <span className={details.isExpired ? 'text-red-400' : 'text-emerald-400'}>
              {details.isExpired ? 'Expired' : 'Active'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-cyan-400 font-mono">API Key Management </h3>
        <button
          onClick={() => setShowAddKey(!showAddKey)}
          className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-md hover:bg-cyan-500/30 
                   text-sm font-mono"
        >
          {showAddKey ? 'Cancel' : 'Add New Key'}
        </button>
      </div>

      {/* Add new API key form */}
      {showAddKey && (
        <form onSubmit={handleAddKey} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="flex-1 rounded-md bg-gray-900/90 px-3 py-2 
                       text-cyan-100 font-mono focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Enter new API key"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-md hover:bg-cyan-500/30 
                       transition-all duration-300 font-mono
                       disabled:bg-gray-700/50 disabled:text-gray-500"
            >
              {isLoading ? 'Adding...' : 'Add Key'}
            </button>
          </div>
        </form>
      )}

      {/* Add Key Details Display */}
      {currentApiKey && <KeyDetailsCard details={keyDetails} />}

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={`flex items-center justify-between p-3 rounded-md ${
              apiKey.key === currentApiKey 
                ? 'bg-cyan-500/10'
                : 'bg-gray-700/30'
            }`}
          >
            <div className="font-mono">
              <div className="text-cyan-300 flex items-center gap-2">
                {apiKey.key.substring(0, 10)}...
                {apiKey.key === currentApiKey && (
                  <span className="text-xs text-cyan-400">(current)</span>
                )}
                {apiKey.isOwner && (
                  <span className="text-xs text-emerald-400">(owner)</span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Added by: {apiKey.userEmail}
              </div>
              <div className={`text-sm ${
                apiKey.dailyUsage >= 450 
                  ? 'text-red-400' 
                  : apiKey.dailyUsage >= 400 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}>
                Usage: {apiKey.dailyUsage}/500
                {apiKey.dailyUsage >= 450 && (
                  <span className="ml-2 text-red-400">(limit reached)</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onKeySelect(apiKey.key)}
                disabled={apiKey.key === currentApiKey}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-md hover:bg-cyan-500/30 
                         text-sm font-mono disabled:opacity-50"
              >
                Use
              </button>
              {apiKey.isOwner && (
                <button
                  onClick={() => handleDeleteKey(apiKey.key)}
                  disabled={apiKey.key === currentApiKey}
                  className="px-3 py-1 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 
                           text-sm font-mono disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {apiKeys.length === 0 && (
          <div className="text-center p-4 rounded-md bg-gray-700/30">
            <p className="text-gray-400 font-mono">No API keys added yet</p>
          </div>
        )}
      </div>

      {/* API Key Recommendations */}
      {apiKeys.length > 0 && (
        <div className="mt-6 p-4 bg-gray-700/30 rounded-md">
          <h4 className="text-cyan-400 font-mono mb-2">Recommendations:</h4>
          {apiKeys.some(key => key.dailyUsage < 450) ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-mono">
                Available API keys ({apiKeys.filter(key => key.dailyUsage < 450).length}):
              </p>
              {apiKeys
                .filter(key => key.dailyUsage < 450)
                .sort((a, b) => a.dailyUsage - b.dailyUsage)
                .slice(0, 3)
                .map(key => (
                  <div key={key.id} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                    <span className="text-cyan-300 font-mono text-sm">
                      {key.key.substring(0, 10)}... ({key.dailyUsage} uses)
                    </span>
                    <button
                      onClick={() => onKeySelect(key.key)}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded 
                               text-xs font-mono hover:bg-cyan-500/30"
                    >
                      Switch
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-red-400 font-mono text-sm">
              All API keys have reached their daily limit. Please add a new key.
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={findAvailableKey}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md hover:bg-cyan-500/30 
                   text-sm font-mono flex-1"
        >
          Switch to Available Key
        </button>
      </div>
    </div>
  )
} 