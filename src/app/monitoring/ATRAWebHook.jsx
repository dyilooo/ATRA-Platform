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

// Stage options for alerts
const STAGE_OPTIONS = {
  TRUE_POSITIVE: 'True Positive',
  FALSE_POSITIVE: 'False Positive',
  TO_BE_CONFIRMED: 'To Be Confirmed'
}

// Updated kill chain stages
const KILL_CHAIN_STAGES = {
  INITIAL_ATTEMPTS: 'Initial Attempts',
  PERSISTENT_FOOTHOLD: 'Persistent Foothold',
  EXPLORATION: 'Exploration',
  PROPAGATION: 'Propagation',
  EXFILTRATION_IMPACT: 'Exfiltration & Impact'
}

// Alert status options
const ALERT_STATUS_OPTIONS = {
  TRUE_POSITIVE: 'True Positive',
  FALSE_POSITIVE: 'False Positive',
  TO_BE_CONFIRMED: 'To Be Confirmed'
}

export default function ATRALegacyWebHook() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      timestamp: '2023-10-01T12:00:00Z',
      shift: 'Morning',
      detectedBy: 'Clifford Uson',
      status: 'NEW',
      stage: 'Initial Attempt',
      alertType: 'Potential Threat',
      technique: 'Phishing',
      srcIP: '192.168.1.1',
      srcIPType: 'Private',
      srcGeoCode: 'US',
      destinationIP: '10.0.0.1',
      dstIPType: 'Private',
      dstGeoCode: 'US',
      sourceHost: 'Host1',
      description: 'Potential threat detected',
      remarks: 'Investigate further',
      links: 'http://example.com/alert/1',
      tenant: 'NIKI'
    },
    {
      id: 2,
      timestamp: '2023-10-02T14:30:00Z',
      shift: 'Afternoon',
      detectedBy: 'Daniel Vetriolo',
      status: 'IN_PROGRESS',
      stage: 'Exfiltration and Impact',
      alertType: 'Malware',
      technique: 'Signature Match',
      srcIP: '192.168.1.2',
      srcIPType: 'Private',
      srcGeoCode: 'US',
      destinationIP: '10.0.0.2',
      dstIPType: 'Private',
      dstGeoCode: 'US',
      sourceHost: 'Host2',
      description: 'Malware signature found',
      remarks: 'Scanning in progress',
      links: 'http://example.com/alert/2',
      tenant: 'SiYCha'
    },
    {
      id: 3,
      timestamp: '2023-10-03T09:15:00Z',
      shift: 'Evening',
      detectedBy: 'Hillary Gab Chua',
      status: 'CLOSED',
      stage: 'Persistent Foothold',
      alertType: 'Suspicious Activity',
      technique: 'Anomaly Detection',
      srcIP: '192.168.1.3',
      srcIPType: 'Private',
      srcGeoCode: 'US',
      destinationIP: '10.0.0.3',
      dstIPType: 'Private',
      dstGeoCode: 'US',
      sourceHost: 'Host3',
      description: 'Suspicious activity logged',
      remarks: 'No action needed',
      links: 'http://example.com/alert/3',
      tenant: 'MPIW'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' })
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterTenant, setFilterTenant] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAlertId, setExpandedAlertId] = useState(null)
  const [tempAlert, setTempAlert] = useState(null)

  // Update alert details
  const updateAlert = (alertId, updatedFields) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, ...updatedFields } : alert
    ))
    toast.success('Alert updated successfully')
    setExpandedAlertId(null) // Collapse section after saving
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
      const matchesTenant = filterTenant === 'ALL' || alert.tenant === filterTenant
      const matchesSearch = searchQuery === '' || 
        Object.values(alert).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesStatus && matchesTenant && matchesSearch
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

  // Update temporary alert details
  const handleTempAlertChange = (field, value) => {
    setTempAlert(prev => ({ ...prev, [field]: value }))
  }

  // Save changes from temporary alert to main alerts state
  const saveAlertChanges = (alertId) => {
    updateAlert(alertId, tempAlert)
    setTempAlert(null) // Clear temporary state after saving
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
            Monitoring Dashboard
          </h1>
          <button
            onClick={() => {
              // Implement refresh logic
            }}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                     hover:bg-cyan-500/30 transition-all duration-300 font-mono
                     border border-cyan-500/30 text-sm"
          >
            Refresh
          </button>
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
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                     rounded-md text-gray-300 font-mono
                     focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Tenants</option>
            <option value="NIKI">NIKI</option>
            <option value="SiYCha">SiYCha</option>
            <option value="MPIW">MPIW</option>
            <option value="MWELL">MWELL</option>
          </select>
        </div>

        {/* Alerts Table */}
        <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/70">
                  {[
                    { key: 'timestamp', label: 'Timestamp' },
                    { key: 'status', label: 'Status' },
                    { key: 'stage', label: 'Kill Chain Stage' },
                    { key: 'alertType', label: 'Alert Type' },
                    { key: 'technique', label: 'Technique' },
                    { key: 'srcIP', label: 'SRC IP' },
                    { key: 'srcIPType', label: 'SRC IP Type' },
                    { key: 'srcGeoCode', label: 'SRC geo Code' },
                    { key: 'destinationIP', label: 'Destination IP' },
                    { key: 'dstIPType', label: 'DST IP Type' },
                    { key: 'dstGeoCode', label: 'DST geo Code' },
                    { key: 'sourceHost', label: 'Source Host' },
                    { key: 'description', label: 'Description' },
                    { key: 'links', label: 'Links' }
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="15" className="p-4 text-center font-mono text-gray-400">
                      Loading alerts...
                    </td>
                  </tr>
                ) : filteredAndSortedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="p-4 text-center font-mono text-gray-400">
                      No alerts found
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedAlerts.map((alert) => (
                    <React.Fragment key={alert.id}>
                      <tr className="border-t border-gray-700/50" onClick={() => {
                        setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)
                        setTempAlert(alert) // Initialize tempAlert with current alert data
                      }}>
                        <td className="p-3 font-mono">{format(new Date(alert.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-mono ${STATUS_OPTIONS[alert.status].color}`}>
                            {STATUS_OPTIONS[alert.status].label}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{alert.stage}</td>
                        <td className="p-3 font-mono">{alert.alertType}</td>
                        <td className="p-3 font-mono">{alert.technique}</td>
                        <td className="p-3 font-mono">{alert.srcIP}</td>
                        <td className="p-3 font-mono">{alert.srcIPType}</td>
                        <td className="p-3 font-mono">{alert.srcGeoCode}</td>
                        <td className="p-3 font-mono">{alert.destinationIP}</td>
                        <td className="p-3 font-mono">{alert.dstIPType}</td>
                        <td className="p-3 font-mono">{alert.dstGeoCode}</td>
                        <td className="p-3 font-mono">{alert.sourceHost}</td>
                        <td className="p-3 font-mono">{alert.description}</td>
                        <td className="p-3">
                          <a href={alert.links} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            View
                          </a>
                        </td>
                      </tr>
                      {expandedAlertId === alert.id && (
                        <tr className="bg-gray-800/70">
                          <td colSpan="15" className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gray-300">Shift</label>
                                <input
                                  type="text"
                                  value={tempAlert.shift}
                                  onChange={(e) => handleTempAlertChange('shift', e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-300">Detected By</label>
                                <input
                                  type="text"
                                  value={tempAlert.detectedBy}
                                  onChange={(e) => handleTempAlertChange('detectedBy', e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-300">Status</label>
                                <select
                                  value={tempAlert.status}
                                  onChange={(e) => handleTempAlertChange('status', e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                >
                                  {Object.entries(STATUS_OPTIONS).map(([status, { label }]) => (
                                    <option key={status} value={status}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-300">Alert Status</label>
                                <select
                                  value={tempAlert.alertStatus}
                                  onChange={(e) => handleTempAlertChange('alertStatus', e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                >
                                  {Object.entries(ALERT_STATUS_OPTIONS).map(([status, label]) => (
                                    <option key={status} value={status}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-gray-300">Remarks</label>
                                <input
                                  type="text"
                                  value={tempAlert.remarks}
                                  onChange={(e) => handleTempAlertChange('remarks', e.target.value)}
                                  className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                />
                              </div>
                              <div className="col-span-2 text-right">
                                <button
                                  onClick={() => saveAlertChanges(alert.id)}
                                  className="px-4 py-2 bg-cyan-500 text-cyan-900 rounded-md 
                                           hover:bg-cyan-600 transition-all duration-300 font-mono
                                           border border-cyan-500 text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
