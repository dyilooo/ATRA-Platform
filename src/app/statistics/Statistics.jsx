"use client"
import { useState } from 'react'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

export default function Statistics() {
  const [tenant, setTenant] = useState('SiyCha')
  const [timeRange, setTimeRange] = useState('This Month')

  // Common chart options
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { color: 'rgba(255, 255, 255, 0.8)' }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: { 
          color: 'rgba(255, 255, 255, 0.8)',
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(255, 255, 255, 0.8)' }
      },
      datalabels: {
        color: 'rgba(255, 255, 255, 0.8)',
        anchor: 'end',
        align: 'top',
        offset: 5,
        formatter: (value) => value.toLocaleString(),
        font: {
          weight: 'bold',
          size: 12
        },
        textStrokeColor: 'rgba(0, 0, 0, 0.5)',
        textStrokeWidth: 2,
        textShadowBlur: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }

  // Sample data
  const dates = ['February 19, 2025', 'February 19, 2025', 'February 21, 2025', 'February 27, 2025', 'March 07, 2025']
  const commonData = {
    labels: dates,
    datasets: [{
      label: 'Count',
      data: [14899, 15417, 18414, 20217, 23492],
      borderColor: 'rgb(34, 211, 238)',
      backgroundColor: 'rgba(34, 211, 238, 0.5)',
      tension: 0.4
    }]
  }

  // Stats cards data
  const statsCards = [
    { title: 'Total SOC Detections', value: '10,431', icon: '🔍' },
    { title: 'Total ATIP Detections', value: '10,431', icon: '🌐' },
    { title: 'Total Threat Vulnerabilities', value: '10,431', icon: '⚠️' },
    { title: 'Total Threat Detections', value: '10,431', icon: '🛡️' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with filters */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 font-mono">Statistics Dashboard</h1>
          <div className="flex gap-4">
            <select 
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              className="bg-gray-800 text-gray-100 px-4 py-2 rounded-md border border-gray-700"
            >
              <option value="SiyCha">SiyCha</option>
              <option value="MWELL">MWELL</option>
              <option value="MPIW">MPIW</option>
              <option value="NIKI">NIKI</option>
            </select>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 text-gray-100 px-4 py-2 rounded-md border border-gray-700"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-lg font-semibold text-gray-300">{card.title}</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SOC Detections */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">SOC Detections</h3>
            <Line data={commonData} options={chartOptions} />
          </div>

          {/* True/False Positives */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">True/False Positives</h3>
            <Line data={commonData} options={chartOptions} />
          </div>

          {/* Malicious Traffic */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Malicious Traffic</h3>
            <Line data={commonData} options={chartOptions} />
          </div>

          {/* Malicious Domains */}
          <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/20">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Malicious Domains</h3>
            <Line data={commonData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
