'use client'

import React, { useState } from 'react'
import { Chart as ChartJS } from 'chart.js/auto'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

export default function ATIPConsolidated() {
  const [selectedTenant, setSelectedTenant] = useState('all')
  const [selectedShift, setSelectedShift] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('today')
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Sample data - replace with actual data from your backend
  const stats = {
    totalMaliciousDomains: 156,
    totalConnectionAttempts: 2847,
    confirmedMalicious: 134,
    blockedConnections: 2456
  }

  const maliciousData = [
    {
      id: 1,
      shift: 'Morning',
      date: '2024-03-20',
      totalDomains: 45,
      totalAttempts: 876,
      confirmedMalicious: 38,
      connectionAttempts: 654,
      accessingIPs: '192.168.1.100, 192.168.1.101',
      status: 'Blocked',
      assignee: 'John Doe',
      sheetLink: 'https://sheets.google.com/...',
      driveFolder: 'https://drive.google.com/...',
      tenant: 'MWELL'
    },
    // Add more data entries...
  ]

  const maliciousDetails = [
    { domain: '91.207.174.2', attempts: 9832, ips: '172.16.26.210' },
    { domain: '77.111.246.15', attempts: 7250, ips: '172.16.11.217' },
    { domain: '71.18.74.198', attempts: 769, ips: '172.16.22.130, 172.16.22.185, 172.16.28.227, 172.16.22.120, 172.16.126.56, 172.16.127.49, 172.16.126.159, 172.16.126.47, 172.16.126.252, 172.16.132.181, 172.16.126.210, 172.16.126.81, 172.16.28.179, 172.16.28.149, 172.16.28.181, 172.16.133.58, 172.16.254.104, 172.16.127.223, 172.16.132.182, 172.16.22.173, 172.16.29.128, 172.16.133.65, 172.16.28.131' },
    { domain: '71.18.74.198', attempts: 563, ips: '172.16.11.217' },
    { domain: '185.184.8.90', attempts: 515, ips: '172.16.11.217' },
    { domain: '163.70.131.58', attempts: 394, ips: '172.16.28.223, 172.16.127.64, 172.16.133.51, 172.16.126.38, 172.16.28.149' },
    { domain: '95.153.31.22', attempts: 269, ips: '172.16.11.217' },
    { domain: '183.2.172.185', attempts: 242, ips: '172.16.11.217' },
    { domain: '77.111.246.8', attempts: 172, ips: '172.16.11.217' },
    { domain: '103.235.46.96', attempts: 162, ips: '172.16.11.217' },
    { domain: '71.18.255.144', attempts: 157, ips: '172.16.11.217' },
    { domain: '84.17.37.217', attempts: 121, ips: '172.16.11.217' },
    { domain: '103.235.47.188', attempts: 121, ips: '172.16.11.217' },
    { domain: '94.23.69.29', attempts: 98, ips: '172.16.1.138' },
    { domain: '162.19.138.119', attempts: 42, ips: '172.16.11.217' },
    { domain: 'acr.amplreq.com', attempts: 40, ips: '172.16.127.120, 172.16.127.32, 172.16.29.202, 172.16.28.227, 172.16.132.50, 172.16.254.107, 172.16.26.136' },
    { domain: 'push-rtmp-l11-sg01.tiktokrow-cdn.com', attempts: 29, ips: '172.16.126.81' },
    { domain: '108.175.6.209', attempts: 29, ips: '172.16.29.230' },
    { domain: 'pull-flv-l1-sg01.tiktokrow-cdn.com', attempts: 20, ips: '172.16.22.155, 172.16.126.81, 172.16.126.56, 172.16.28.181' },
    { domain: '87.98.242.75', attempts: 20, ips: '172.16.1.138' },
    { domain: 'pull-flv-l1-va01.tiktokrow-cdn.com', attempts: 18, ips: '172.16.22.155, 172.16.126.81, 172.16.126.56, 172.16.28.181' },
    { domain: 'pull-o5-va01.tiktokrow-cdn.com', attempts: 18, ips: '172.16.126.56, 172.16.126.81' },
    { domain: 'google-ohttp-relay-safebrowsing.fastly-edge.com', attempts: 16, ips: '172.16.28.94, 172.16.126.32, 172.16.26.116, 172.16.26.242' },
    { domain: 'pull-flv-l11-sg01.tiktokrow-cdn.com', attempts: 15, ips: '172.16.126.81' },
    { domain: '1f2e7.v.fwmrm.net', attempts: 12, ips: '172.16.127.163' },
    { domain: '15.204.46.116', attempts: 12, ips: '172.16.11.217' },
    { domain: '87.240.132.67', attempts: 11, ips: '172.16.11.217' },
    { domain: '104.244.42.67', attempts: 10, ips: '172.16.11.217' },
    { domain: '185.184.10.30', attempts: 10, ips: '172.16.11.217' },
    { domain: '212.73.86.164', attempts: 10, ips: '172.16.26.131, 172.16.11.185, 172.16.26.62' },
    { domain: '103.152.215.3', attempts: 10, ips: '172.16.133.183' },
    { domain: '95.216.192.15', attempts: 8, ips: '172.16.11.185, 172.16.26.62, 172.16.26.131' },
    { domain: '223.5.5.5', attempts: 8, ips: '172.16.22.169, 172.16.28.181, 172.16.132.227, 172.16.28.149, 172.16.28.177' },
    { domain: '89.188.168.237', attempts: 7, ips: '172.16.29.161' },
    { domain: '185.205.141.118', attempts: 6, ips: '172.16.29.161' },
    { domain: '185.253.41.209', attempts: 6, ips: '172.16.29.161' },
    { domain: '31.173.83.70', attempts: 5, ips: '172.16.29.161' },
    { domain: '188.162.80.205', attempts: 5, ips: '172.16.29.161' },
    { domain: '174.136.29.202', attempts: 5, ips: '172.16.29.3' },
    { domain: '80.83.239.77', attempts: 5, ips: '172.16.29.161' },
    { domain: '202.191.103.134', attempts: 5, ips: '172.16.29.161' },
    { domain: '95.216.144.226', attempts: 4, ips: '172.16.26.62, 172.16.11.185' },
    { domain: '80.241.0.72', attempts: 4, ips: '172.16.11.185, 172.16.26.62' },
    { domain: '103.104.28.105', attempts: 4, ips: '172.16.26.131, 172.16.26.62' },
    { domain: '71.18.255.224', attempts: 4, ips: '172.16.22.155, 172.16.126.252' },
    { domain: '37.236.94.12', attempts: 4, ips: '172.16.22.72' },
    { domain: '89.37.150.9', attempts: 4, ips: '172.16.29.161' },
    { domain: '43.129.254.124', attempts: 3, ips: '172.16.11.217' },
    { domain: '43.154.252.110', attempts: 3, ips: '172.16.11.217' },
    { domain: '94.130.198.6', attempts: 3, ips: '172.16.11.217' },
    { domain: '203.80.128.20', attempts: 3, ips: '172.16.11.185, 172.16.26.62' },
    { domain: '95.85.105.181', attempts: 3, ips: '172.16.29.161' },
    { domain: '71.18.255.225', attempts: 3, ips: '172.16.22.155, 172.16.126.252' },
    { domain: '151.238.73.60', attempts: 3, ips: '172.16.29.161' },
    { domain: '84.17.37.217', attempts: 3, ips: '172.16.29.105' },
    { domain: '151.238.155.75', attempts: 3, ips: '172.16.29.161' },
    { domain: '203.119.238.64', attempts: 3, ips: '172.16.126.30' },
    { domain: '85.26.232.15', attempts: 3, ips: '172.16.29.161' },
    { domain: '94.25.168.191', attempts: 3, ips: '172.16.29.161' },
    { domain: 'push-rtmp-l1-va01.tiktokrow-cdn.com', attempts: 2, ips: '172.16.126.56' },
    { domain: 'urchintelemetry.com', attempts: 2, ips: '172.16.33.52' },
    { domain: 'bellsyscdn.com', attempts: 2, ips: '172.16.33.52' },
    { domain: 'google-ohttp-relay-query.fastly-edge.com', attempts: 2, ips: '172.16.132.47, 172.16.126.95' },
    { domain: '104.244.42.195', attempts: 2, ips: '172.16.29.161' },
    { domain: '72.52.178.23', attempts: 2, ips: '172.16.11.217' },
    { domain: '108.175.6.223', attempts: 2, ips: '172.16.11.217' },
    { domain: '162.19.57.9', attempts: 2, ips: '172.16.11.217' },
    { domain: '45.133.44.53', attempts: 2, ips: '172.16.11.217' },
    { domain: '156.225.96.80', attempts: 2, ips: '172.16.11.217' },
    { domain: 'pct-upd.info', attempts: 1, ips: '172.16.127.104' },
    { domain: '172.240.108.68', attempts: 1, ips: '172.16.11.217' },
    { domain: '192.243.59.13', attempts: 1, ips: '172.16.11.217' },
    { domain: '192.243.59.20', attempts: 1, ips: '172.16.11.217' }
  ]

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Malicious Domains Detected',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgb(6, 182, 212)',
        tension: 0.1
      },
      {
        label: 'Connection Attempts',
        data: [28, 48, 40, 19, 86],
        borderColor: 'rgb(234, 179, 8)',
        tension: 0.1
      }
    ]
  }

  const tenantDistribution = {
    labels: ['MWELL', 'SiyCha', 'MPIW', 'NIKI'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: [
        'rgba(6, 182, 212, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ]
    }]
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4 font-mono">
            ATIP Consolidated Malicious Domains
          </h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            >
              <option value="all">All Tenants</option>
              <option value="MWELL">MWELL</option>
              <option value="SiyCha">SiyCha</option>
              <option value="MPIW">MPIW</option>
              <option value="NIKI">NIKI</option>
            </select>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="graveyard">Graveyard</option>
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-yellow-400 text-sm font-mono mb-2">Total Malicious Domains</h3>
              <p className="text-2xl font-bold text-gray-200">{stats.totalMaliciousDomains}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-yellow-400 text-sm font-mono mb-2">Total Connection Attempts</h3>
              <p className="text-2xl font-bold text-gray-200">{stats.totalConnectionAttempts}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-yellow-400 text-sm font-mono mb-2">Confirmed Malicious</h3>
              <p className="text-2xl font-bold text-gray-200">{stats.confirmedMalicious}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-yellow-400 text-sm font-mono mb-2">Blocked Connections</h3>
              <p className="text-2xl font-bold text-gray-200">{stats.blockedConnections}</p>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-cyan-400 font-mono">Trend Summary</h3>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm font-mono">
                  View Details
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Last 24 Hours</span>
                  <span className="text-yellow-400 font-mono">+12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Last 7 Days</span>
                  <span className="text-yellow-400 font-mono">+8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Last 30 Days</span>
                  <span className="text-yellow-400 font-mono">+5%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-cyan-400 font-mono">Tenant Distribution</h3>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm font-mono">
                  View Details
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">MWELL</span>
                  <span className="text-yellow-400 font-mono">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">SiyCha</span>
                  <span className="text-yellow-400 font-mono">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">MPIW</span>
                  <span className="text-yellow-400 font-mono">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">NIKI</span>
                  <span className="text-yellow-400 font-mono">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="bg-gray-700/50">
                  <tr className="font-mono">
                    <th className="px-4 py-3 text-left">Shift</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Tenant</th>
                    <th className="px-4 py-3 text-left">Total Domains</th>
                    <th className="px-4 py-3 text-left">Connection Attempts</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Assignee</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {maliciousData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-mono">{item.shift}</td>
                      <td className="px-4 py-3 font-mono">{item.date}</td>
                      <td className="px-4 py-3 font-mono">{item.tenant}</td>
                      <td className="px-4 py-3 font-mono">{item.totalDomains}</td>
                      <td className="px-4 py-3 font-mono">{item.connectionAttempts}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono
                          ${item.status === 'Blocked' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{item.assignee}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button 
                            className="text-cyan-400 hover:text-cyan-300"
                            onClick={() => setShowDetailsModal(true)}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-cyan-400 font-mono text-xl">Malicious Domains Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="bg-gray-700/50">
                    <tr className="font-mono">
                      <th className="px-4 py-3 text-left">Confirmed Malicious Domains</th>
                      <th className="px-4 py-3 text-left">Connection Attempts</th>
                      <th className="px-4 py-3 text-left">Accessing Internal IPs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {maliciousDetails.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-mono">{detail.domain}</td>
                        <td className="px-4 py-3 font-mono">{detail.attempts}</td>
                        <td className="px-4 py-3 font-mono">{detail.ips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
