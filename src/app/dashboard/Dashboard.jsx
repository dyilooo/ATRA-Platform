'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/services/firebase'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month')
  const [selectedTenant, setSelectedTenant] = useState('All')

  // Sample data - replace with actual data from your backend
  const logIngestionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Total Ingestion',
      data: [120, 150, 180, 140],
      borderColor: 'rgb(6, 182, 212)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const alertsByTenantData = {
    labels: ['NIKI', 'SiYCha', 'MPIW', 'MWELL'],
    datasets: [{
      data: [30, 25, 20, 25],
      backgroundColor: [
        'rgba(6, 182, 212, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ]
    }]
  }

  const incidentTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Incidents',
      data: [5, 8, 3, 7, 4, 6, 2],
      backgroundColor: 'rgba(6, 182, 212, 0.8)'
    }]
  }

  // Chart options with plugins for displaying values
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9CA3AF' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#9CA3AF' }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      },
      datalabels: {
        color: '#9CA3AF',
        anchor: 'end',
        align: 'top',
        formatter: (value) => value,
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#9CA3AF' }
      },
      datalabels: {
        color: '#fff',
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex]
          return `${label}\n${value}`
        },
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: '#9CA3AF' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#9CA3AF' }
      },
      datalabels: {
        color: '#9CA3AF',
        anchor: 'end',
        align: 'top',
        formatter: (value) => value,
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  }

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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
            Security Dashboard
          </h1>
          <div className="flex gap-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                       rounded-md text-gray-300 font-mono focus:outline-none focus:border-cyan-500/50"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
            </select>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                       rounded-md text-gray-300 font-mono focus:outline-none focus:border-cyan-500/50"
            >
              <option>All</option>
              <option>NIKI</option>
              <option>SiYCha</option>
              <option>MPIW</option>
              <option>MWELL</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Alerts', value: '1,234', change: '+12%', color: 'cyan' },
            { title: 'Critical Incidents', value: '25', change: '-5%', color: 'red' },
            { title: 'Average Response Time', value: '15m', change: '-20%', color: 'green' },
            { title: 'Resolution Rate', value: '94%', change: '+2%', color: 'yellow' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
              <h3 className="text-gray-400 font-mono text-sm mb-2">{stat.title}</h3>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Log Ingestion Chart */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 font-mono">Total Log Ingestion</h3>
            <div className="h-[300px]">
              <Line
                data={logIngestionData}
                options={lineChartOptions}
              />
            </div>
          </div>

          {/* Alerts by Tenant */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 font-mono">Alerts by Tenant</h3>
            <div className="h-[300px] flex justify-center">
              <Doughnut
                data={alertsByTenantData}
                options={doughnutChartOptions}
              />
            </div>
          </div>

          {/* Incident Trends */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 font-mono">Incident Trends</h3>
            <div className="h-[300px]">
              <Bar
                data={incidentTrendData}
                options={barChartOptions}
              />
            </div>
          </div>

          {/* Recent Alerts Table */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 font-mono">Recent Alerts</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="pb-3 font-mono">Time</th>
                    <th className="pb-3 font-mono">Tenant</th>
                    <th className="pb-3 font-mono">Type</th>
                    <th className="pb-3 font-mono">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { time: '10:30 AM', tenant: 'NIKI', type: 'Malware', status: 'Critical' },
                    { time: '09:45 AM', tenant: 'SiYCha', type: 'Phishing', status: 'High' },
                    { time: '09:15 AM', tenant: 'MPIW', type: 'Intrusion', status: 'Medium' },
                    { time: '08:30 AM', tenant: 'MWELL', type: 'DDoS', status: 'Low' },
                  ].map((alert, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-2 font-mono">{alert.time}</td>
                      <td className="py-2 font-mono">{alert.tenant}</td>
                      <td className="py-2 font-mono">{alert.type}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-mono
                          ${alert.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            alert.status === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            alert.status === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'}`}>
                          {alert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
