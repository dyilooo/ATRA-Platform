'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

// Status options for alerts
const STATUS_OPTIONS = {
  NEW: { label: 'New', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  CLOSED: { label: 'Closed', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
}

export default function ATRAMonitoring() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' })
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlerts, setSelectedAlerts] = useState([])

  // Fetch alerts from your Stellar platform API
  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('YOUR_STELLAR_API_ENDPOINT')
      const data = await response.json()
      setAlerts(data.map(alert => ({
        ...alert,
        status: alert.status || 'NEW' // Set default status if none exists
      })))
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  // Update alert status
  const updateAlertStatus = async (alertId, newStatus) => {
    try {
      // Replace with your actual API endpoint
      await fetch(`YOUR_API_ENDPOINT/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ))

      toast.success('Alert status updated successfully')
    } catch (error) {
      console.error('Error updating alert status:', error)
      toast.error('Failed to update alert status')
    }
  }

  // Sorting function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  // Filter and sort alerts
  const filteredAndSortedAlerts = alerts
    .filter(alert => {
      const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus
      const matchesSearch = searchQuery === '' || 
        Object.values(alert).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'asc' 
          ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
          : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key])
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
        : b[sortConfig.key] > a[sortConfig.key] ? 1 : -1
    })

  // Bulk status update
  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      // Update each selected alert
      await Promise.all(selectedAlerts.map(alertId =>
        updateAlertStatus(alertId, newStatus)
      ))
      setSelectedAlerts([]) // Clear selection after update
      toast.success('Bulk status update completed')
    } catch (error) {
      console.error('Error in bulk update:', error)
      toast.error('Failed to update some alerts')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
            ATRA Monitoring Dashboard
          </h1>
          <div className="flex gap-4">
            {selectedAlerts.length > 0 && (
              <div className="flex gap-2">
                {Object.entries(STATUS_OPTIONS).map(([status, { label, color }]) => (
                  <button
                    key={status}
                    onClick={() => handleBulkStatusUpdate(status)}
                    className={`px-4 py-2 rounded-md font-mono text-sm ${color}`}
                  >
                    Set {label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                       hover:bg-cyan-500/30 transition-all duration-300 font-mono
                       border border-cyan-500/30 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                       rounded-md text-gray-300 placeholder-gray-500 font-mono
                       focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                     rounded-md text-gray-300 font-mono
                     focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Status</option>
            {Object.entries(STATUS_OPTIONS).map(([status, { label }]) => (
              <option key={status} value={status}>{label}</option>
            ))}
          </select>
        </div>

        {/* Alerts Table */}
        <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/70">
                  <th className="w-8 p-3">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.length === filteredAndSortedAlerts.length}
                      onChange={(e) => {
                        setSelectedAlerts(e.target.checked 
                          ? filteredAndSortedAlerts.map(a => a.id)
                          : []
                        )
                      }}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                  </th>
                  {[
                    { key: 'timestamp', label: 'Timestamp' },
                    { key: 'severity', label: 'Severity' },
                    { key: 'source', label: 'Source' },
                    { key: 'description', label: 'Description' },
                    { key: 'status', label: 'Status' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        {sortConfig.key === key && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-left font-mono text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center font-mono text-gray-400">
                      Loading alerts...
                    </td>
                  </tr>
                ) : filteredAndSortedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center font-mono text-gray-400">
                      No alerts found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedAlerts.map((alert) => (
                    <tr key={alert.id} className="border-t border-gray-700/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.includes(alert.id)}
                          onChange={(e) => {
                            setSelectedAlerts(e.target.checked
                              ? [...selectedAlerts, alert.id]
                              : selectedAlerts.filter(id => id !== alert.id)
                            )
                          }}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                      </td>
                      <td className="p-3 font-mono">
                        {format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono
                          ${alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{alert.source}</td>
                      <td className="p-3 font-mono">{alert.description}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-mono ${STATUS_OPTIONS[alert.status].color}`}>
                          {STATUS_OPTIONS[alert.status].label}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={alert.status}
                          onChange={(e) => updateAlertStatus(alert.id, e.target.value)}
                          className="px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                   rounded-md text-gray-300 font-mono text-sm
                                   focus:outline-none focus:border-cyan-500/50"
                        >
                          {Object.entries(STATUS_OPTIONS).map(([status, { label }]) => (
                            <option key={status} value={status}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
