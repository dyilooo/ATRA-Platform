"use client"
import { useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Reports() {
  const [tenant, setTenant] = useState('SiyCha')
  const [shift, setShift] = useState('2PM-10PM')
  const [date, setDate] = useState('2024-03-17')

  // Sample data based on your report
  const threatData = {
    labels: [
      'Active Scanning',
      'Boot/Logon Autostart',
      'Brute Force',
      'Exploit Public-Facing',
      'Remote Services',
      'Network Scanning',
      'Phishing',
      'XDR Endpoint Threat'
    ],
    datasets: [
      {
        label: 'False Positive',
        data: [0, 0, 0, 0, 1, 0, 0, 3],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'To Be Confirmed',
        data: [10, 7, 18, 5, 2, 6, 1, 25],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
      {
        label: 'True Positive',
        data: [7, 0, 5, 2, 0, 0, 0, 242],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  }

  const xdrAnomalyData = {
    labels: ['App Anomaly', 'Bytes Anomaly', 'Firewall Anomaly', 'Process Anomaly', 'Session Anomaly'],
    datasets: [
      {
        label: 'Number of Incidents',
        data: [4, 3, 144, 4, 1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const totalMetricsData = {
    labels: ['Total Malicious Traffic', 'Total Malicious Domain'],
    datasets: [
      {
        label: 'Count',
        data: [5891, 58],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Security Incident Reports</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <select 
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            className="bg-gray-800 text-gray-100 p-2 rounded-md border border-gray-700"
          >
            <option value="SiyCha">SiyCha</option>
            <option value="MWELL">MWELL</option>
            <option value="MPIW">MPIW</option>
            <option value="NIKI">NIKI</option>
          </select>

          <select 
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="bg-gray-800 text-gray-100 p-2 rounded-md border border-gray-700"
          >
            <option value="2PM-10PM">2PM-10PM</option>
            <option value="6AM-2PM">6AM-2PM</option>
            <option value="10PM-6AM">10PM-6AM</option>
          </select>

          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-800 text-gray-100 p-2 rounded-md border border-gray-700"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Threat Detection Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Threat Detection Overview</h2>
            <Bar 
              data={threatData}
              options={{
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
                    ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255, 255, 255, 0.8)' }
                  }
                }
              }}
            />
          </div>

          {/* XDR Anomalies Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">XDR Anomalies Distribution</h2>
            <Doughnut 
              data={xdrAnomalyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: 'rgba(255, 255, 255, 0.8)' }
                  }
                }
              }}
            />
          </div>

          {/* Total Metrics Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Total Malicious Activity</h2>
            <Bar 
              data={totalMetricsData}
              options={{
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
                    ticks: { color: 'rgba(255, 255, 255, 0.8)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255, 255, 255, 0.8)' }
                  }
                }
              }}
            />
          </div>

          {/* Summary Statistics */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300">Total Incidents</h3>
                <p className="text-3xl font-bold text-white">515</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300">True Positives</h3>
                <p className="text-3xl font-bold text-white">398</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300">False Positives</h3>
                <p className="text-3xl font-bold text-white">28</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300">To Be Confirmed</h3>
                <p className="text-3xl font-bold text-white">89</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
