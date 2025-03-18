'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FiRefreshCw, FiDownload, FiSettings } from 'react-icons/fi'

// Status options for detections
const STATUS_OPTIONS = {
    BLOCKED: {
        label: 'This IP address was already blocked on both Firewalls.',
        color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    PENDING: {
        label: 'Pending investigation.',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    ESCALATED: {
        label: 'Escalated for further action.',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
}

// Shift options with colors
const SHIFT_OPTIONS = {
    MORNING: {
        label: '6AM - 2PM',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    AFTERNOON: {
        label: '2PM - 10PM',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    EVENING: {
        label: '10PM - 6AM',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
}

// Column definitions
const COLUMNS = {
    shift: { label: 'Shift', visible: true },
    dateOfDetection: { label: 'Date of Detection', visible: true },
    totalMaliciousDomains: {
        label: 'Total Malicious Domains/IPs',
        visible: true
    },
    totalConnectionAttempts: {
        label: 'Total Connection Attempts',
        visible: true
    },
    confirmedMaliciousDomains: {
        label: 'Confirmed Malicious Domains',
        visible: true
    },
    connectionAttempts: { label: 'Connection Attempts', visible: true },
    accessingInternalIPs: { label: 'Accessing Internal IPs', visible: true },
    status: { label: 'Status', visible: true },
    assignee: { label: 'Assignee', visible: true },
    links: { label: 'Links', visible: true }
}

export default function ATIPConsolidatedReport() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShift, setSelectedShift] = useState('ALL')
    const [expandedRows, setExpandedRows] = useState({})
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    })
    const [showColumnSettings, setShowColumnSettings] = useState(false)
    const [showExportPreview, setShowExportPreview] = useState(false)
    const [columnVisibility, setColumnVisibility] = useState(COLUMNS)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Sample data - replace with actual data from your backend
    const [detections, setDetections] = useState([
        {
            id: 1,
            shift: '6AM - 2PM',
            dateOfDetection: '2024-03-21T08:00:00Z',
            totalMaliciousDomains: 6,
            totalConnectionAttempts: 2579,
            confirmedMaliciousDomains: [
                'acr.amplreq.com',
                '185.184.8.90',
                '71.18.74.198',
                '95.153.31.22',
                '183.2.172.185',
                '59.82.132.217'
            ],
            connectionAttempts: [64, 1068, 876, 423, 174, 174],
            accessingInternalIPs: [
                '172.16.126.242',
                '172.16.127.203',
                '172.16.26.136',
                '172.16.127.197',
                '172.16.29.60'
            ],
            status: 'BLOCKED',
            assignee: 'John Doe',
            sheetsLink: 'https://sheets.google.com/example1',
            driveFolder: 'https://drive.google.com/example1'
        },
        {
            id: 2,
            shift: '2PM - 10PM',
            dateOfDetection: '2024-03-21T15:30:00Z',
            totalMaliciousDomains: 4,
            totalConnectionAttempts: 1892,
            confirmedMaliciousDomains: [
                'acr.amplreq.com',
                '185.184.8.90',
                '71.18.74.198',
                '95.153.31.22'
            ],
            connectionAttempts: [64, 1068, 876, 423],
            accessingInternalIPs: [
                '172.16.126.242',
                '172.16.127.203',
                '172.16.26.136'
            ],
            status: 'PENDING',
            assignee: 'Jane Smith',
            sheetsLink: 'https://sheets.google.com/example2',
            driveFolder: 'https://drive.google.com/example2'
        },
        {
            id: 3,
            shift: '10PM - 6AM',
            dateOfDetection: '2024-03-21T23:00:00Z',
            totalMaliciousDomains: 5,
            totalConnectionAttempts: 2150,
            confirmedMaliciousDomains: [
                'acr.amplreq.com',
                '185.184.8.90',
                '71.18.74.198',
                '95.153.31.22',
                '183.2.172.185'
            ],
            connectionAttempts: [64, 1068, 876, 423, 174],
            accessingInternalIPs: [
                '172.16.126.242',
                '172.16.127.203',
                '172.16.26.136',
                '172.16.127.197'
            ],
            status: 'ESCALATED',
            assignee: 'Mike Johnson',
            sheetsLink: 'https://sheets.google.com/example3',
            driveFolder: 'https://drive.google.com/example3'
        }
    ])

    // Load column visibility preferences from localStorage
    useEffect(() => {
        const savedVisibility = localStorage.getItem('columnVisibility')
        if (savedVisibility) {
            setColumnVisibility(JSON.parse(savedVisibility))
        }
    }, [])

    // Save column visibility preferences to localStorage
    useEffect(() => {
        localStorage.setItem(
            'columnVisibility',
            JSON.stringify(columnVisibility)
        )
    }, [columnVisibility])

    // Toggle column visibility
    const toggleColumn = (columnKey) => {
        setColumnVisibility((prev) => ({
            ...prev,
            [columnKey]: {
                ...prev[columnKey],
                visible: !prev[columnKey].visible
            }
        }))
    }

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Sort data
    const sortedDetections = [...detections].sort((a, b) => {
        if (!sortConfig.key) return 0

        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (sortConfig.key === 'dateOfDetection') {
            return sortConfig.direction === 'asc'
                ? new Date(aValue) - new Date(bValue)
                : new Date(bValue) - new Date(aValue)
        }

        return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue
    })

    // Handle refresh
    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            // Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000))
            // setDetections(await fetchLatestData())
        } catch (error) {
            console.error('Error refreshing data:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    // Export functions
    const exportToCSV = () => {
        const headers = Object.entries(columnVisibility)
            .filter(([_, config]) => config.visible)
            .map(([_, config]) => config.label)
            .join(',')

        const rows = sortedDetections
            .map((detection) => {
                return Object.entries(columnVisibility)
                    .filter(([_, config]) => config.visible)
                    .map(([key, _]) => {
                        const value = detection[key]
                        if (Array.isArray(value)) {
                            return `"${value.join('; ')}"`
                        }
                        return value
                    })
                    .join(',')
            })
            .join('\n')

        const csv = `${headers}\n${rows}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'atip-report.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const exportToExcel = () => {
        // Implement Excel export
        console.log('Export to Excel')
    }

    const exportToPDF = () => {
        // Implement PDF export
        console.log('Export to PDF')
    }

    // Toggle expanded state for a row
    const toggleExpanded = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // Get shift color
    const getShiftColor = (shift) => {
        const shiftKey = Object.keys(SHIFT_OPTIONS).find(
            (key) => SHIFT_OPTIONS[key].label === shift
        )
        return shiftKey ? SHIFT_OPTIONS[shiftKey].color : ''
    }

    // Calculate daily statistics
    const dailyStats = detections.reduce((acc, detection) => {
        const date = format(new Date(detection.dateOfDetection), 'yyyy-MM-dd')
        if (!acc[date]) {
            acc[date] = {
                date: detection.dateOfDetection,
                totalMaliciousDomains: 0,
                totalConnectionAttempts: 0
            }
        }
        acc[date].totalMaliciousDomains += detection.totalMaliciousDomains
        acc[date].totalConnectionAttempts += detection.totalConnectionAttempts
        return acc
    }, {})

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                            ATIP Consolidated Malicious Domains Report
                        </h1>
                        <p className="text-gray-400 mt-2 font-mono">
                            Total Detections: {detections.length}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                     rounded-md text-gray-300 hover:bg-gray-800/70 
                                     transition-colors duration-200 flex items-center gap-2">
                            <FiRefreshCw
                                className={`${
                                    isRefreshing ? 'animate-spin' : ''
                                }`}
                            />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowExportPreview(true)}
                            className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                     rounded-md text-gray-300 hover:bg-gray-800/70 
                                     transition-colors duration-200 flex items-center gap-2">
                            <FiDownload />
                            Export
                        </button>
                        <button
                            onClick={() => setShowColumnSettings(true)}
                            className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                     rounded-md text-gray-300 hover:bg-gray-800/70 
                                     transition-colors duration-200 flex items-center gap-2">
                            <FiSettings />
                            Columns
                        </button>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search all fields..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                     rounded-md text-gray-300 placeholder-gray-500 font-mono
                                     focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <select
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                 rounded-md text-gray-300 font-mono
                                 focus:outline-none focus:border-cyan-500/50">
                        <option value="ALL">All Shifts</option>
                        {Object.values(SHIFT_OPTIONS).map(({ label }) => (
                            <option key={label} value={label}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Totals Summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                        <h3 className="text-sm font-mono text-gray-400 mb-2">
                            Total Malicious Domains/IPs
                        </h3>
                        <p className="text-2xl font-mono text-cyan-400">
                            {detections.reduce(
                                (acc, detection) =>
                                    acc + detection.totalMaliciousDomains,
                                0
                            )}
                        </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                        <h3 className="text-sm font-mono text-gray-400 mb-2">
                            Total Connection Attempts
                        </h3>
                        <p className="text-2xl font-mono text-cyan-400">
                            {detections.reduce(
                                (acc, detection) =>
                                    acc + detection.totalConnectionAttempts,
                                0
                            )}
                        </p>
                    </div>
                </div>

                {/* Detailed Detections Table */}
                <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden mb-8">
                    <div className="p-4 border-b border-cyan-500/20">
                        <h2 className="text-lg font-mono text-cyan-300">
                            Detailed Detections
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-800/70">
                                    {Object.entries(columnVisibility).map(
                                        ([key, config]) =>
                                            config.visible && (
                                                <th
                                                    key={key}
                                                    className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                                    onClick={() =>
                                                        handleSort(key)
                                                    }>
                                                    {config.label}
                                                    {sortConfig.key === key && (
                                                        <span className="ml-1">
                                                            {sortConfig.direction ===
                                                            'asc'
                                                                ? '↑'
                                                                : '↓'}
                                                        </span>
                                                    )}
                                                </th>
                                            )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDetections.map((detection) => (
                                    <React.Fragment key={detection.id}>
                                        <tr className="border-t border-gray-700/50">
                                            {Object.entries(
                                                columnVisibility
                                            ).map(
                                                ([key, config]) =>
                                                    config.visible && (
                                                        <td
                                                            key={key}
                                                            className="p-3 font-mono">
                                                            {/* Render cell content based on column type */}
                                                            {key ===
                                                                'shift' && (
                                                                <span
                                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${getShiftColor(
                                                                        detection[
                                                                            key
                                                                        ]
                                                                    )}`}>
                                                                    {
                                                                        detection[
                                                                            key
                                                                        ]
                                                                    }
                                                                </span>
                                                            )}
                                                            {key ===
                                                                'dateOfDetection' &&
                                                                format(
                                                                    new Date(
                                                                        detection[
                                                                            key
                                                                        ]
                                                                    ),
                                                                    'MMMM d, yyyy'
                                                                )}
                                                            {key ===
                                                                'confirmedMaliciousDomains' && (
                                                                <div className="space-y-1">
                                                                    {detection[
                                                                        key
                                                                    ]
                                                                        .slice(
                                                                            0,
                                                                            expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? undefined
                                                                                : 3
                                                                        )
                                                                        .map(
                                                                            (
                                                                                domain
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        domain
                                                                                    }
                                                                                    className="text-xs">
                                                                                    {
                                                                                        domain
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {detection[
                                                                        key
                                                                    ].length >
                                                                        3 && (
                                                                        <button
                                                                            onClick={() =>
                                                                                toggleExpanded(
                                                                                    detection.id
                                                                                )
                                                                            }
                                                                            className="text-cyan-400 hover:underline text-xs">
                                                                            {expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? 'Show Less'
                                                                                : 'See More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {key ===
                                                                'connectionAttempts' && (
                                                                <div className="space-y-1">
                                                                    {detection[
                                                                        key
                                                                    ]
                                                                        .slice(
                                                                            0,
                                                                            expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? undefined
                                                                                : 3
                                                                        )
                                                                        .map(
                                                                            (
                                                                                attempts,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="text-xs">
                                                                                    {
                                                                                        attempts
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {detection[
                                                                        key
                                                                    ].length >
                                                                        3 && (
                                                                        <button
                                                                            onClick={() =>
                                                                                toggleExpanded(
                                                                                    detection.id
                                                                                )
                                                                            }
                                                                            className="text-cyan-400 hover:underline text-xs">
                                                                            {expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? 'Show Less'
                                                                                : 'See More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {key ===
                                                                'accessingInternalIPs' && (
                                                                <div className="space-y-1">
                                                                    {detection[
                                                                        key
                                                                    ]
                                                                        .slice(
                                                                            0,
                                                                            expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? undefined
                                                                                : 3
                                                                        )
                                                                        .map(
                                                                            (
                                                                                ip
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        ip
                                                                                    }
                                                                                    className="text-xs">
                                                                                    {
                                                                                        ip
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {detection[
                                                                        key
                                                                    ].length >
                                                                        3 && (
                                                                        <button
                                                                            onClick={() =>
                                                                                toggleExpanded(
                                                                                    detection.id
                                                                                )
                                                                            }
                                                                            className="text-cyan-400 hover:underline text-xs">
                                                                            {expandedRows[
                                                                                detection
                                                                                    .id
                                                                            ]
                                                                                ? 'Show Less'
                                                                                : 'See More'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {key ===
                                                                'status' && (
                                                                <span
                                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                                        STATUS_OPTIONS[
                                                                            detection[
                                                                                key
                                                                            ]
                                                                        ].color
                                                                    }`}>
                                                                    {
                                                                        STATUS_OPTIONS[
                                                                            detection[
                                                                                key
                                                                            ]
                                                                        ].label
                                                                    }
                                                                </span>
                                                            )}
                                                            {key ===
                                                                'links' && (
                                                                <div className="space-y-2">
                                                                    <a
                                                                        href={
                                                                            detection.sheetsLink
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block text-cyan-400 hover:underline text-xs">
                                                                        View
                                                                        Sheets
                                                                    </a>
                                                                    <a
                                                                        href={
                                                                            detection.driveFolder
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block text-cyan-400 hover:underline text-xs">
                                                                        View
                                                                        Drive
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {![
                                                                'shift',
                                                                'dateOfDetection',
                                                                'confirmedMaliciousDomains',
                                                                'connectionAttempts',
                                                                'accessingInternalIPs',
                                                                'status',
                                                                'links'
                                                            ].includes(key) &&
                                                                detection[key]}
                                                        </td>
                                                    )
                                            )}
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Daily Summary Table */}
                <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
                    <div className="p-4 border-b border-cyan-500/20">
                        <h2 className="text-lg font-mono text-cyan-300">
                            Daily Summary
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-800/70">
                                    <th
                                        className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                        onClick={() => handleSort('date')}>
                                        Date
                                        {sortConfig.key === 'date' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc'
                                                    ? '↑'
                                                    : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th className="p-3 text-left font-mono text-gray-400">
                                        Total Malicious Domains/IPs
                                    </th>
                                    <th className="p-3 text-left font-mono text-gray-400">
                                        Total Connection Attempts
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(dailyStats).map(
                                    (stat, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-gray-700/50">
                                            <td className="p-3 font-mono">
                                                {format(
                                                    new Date(stat.date),
                                                    'MMMM d, yyyy'
                                                )}
                                            </td>
                                            <td className="p-3 font-mono">
                                                {stat.totalMaliciousDomains}
                                            </td>
                                            <td className="p-3 font-mono">
                                                {stat.totalConnectionAttempts}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Column Settings Modal */}
            {showColumnSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-mono text-cyan-300">
                                Column Settings
                            </h3>
                            <button
                                onClick={() => setShowColumnSettings(false)}
                                className="text-gray-400 hover:text-gray-300">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(columnVisibility).map(
                                ([key, config]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between">
                                        <label className="text-gray-300 font-mono">
                                            {config.label}
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={config.visible}
                                            onChange={() => toggleColumn(key)}
                                            className="form-checkbox h-4 w-4 text-cyan-500"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export Preview Modal */}
            {showExportPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-mono text-cyan-300">
                                Export Preview
                            </h3>
                            <button
                                onClick={() => setShowExportPreview(false)}
                                className="text-gray-400 hover:text-gray-300">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={exportToCSV}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300">
                                    Export as CSV
                                </button>
                                <button
                                    onClick={exportToExcel}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300">
                                    Export as Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300">
                                    Export as PDF
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            {Object.entries(columnVisibility)
                                                .filter(
                                                    ([_, config]) =>
                                                        config.visible
                                                )
                                                .map(([key, config]) => (
                                                    <th
                                                        key={key}
                                                        className="p-3 text-left font-mono text-gray-300">
                                                        {config.label}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedDetections
                                            .slice(0, 5)
                                            .map((detection) => (
                                                <tr
                                                    key={detection.id}
                                                    className="border-t border-gray-700">
                                                    {Object.entries(
                                                        columnVisibility
                                                    )
                                                        .filter(
                                                            ([_, config]) =>
                                                                config.visible
                                                        )
                                                        .map(([key, _]) => (
                                                            <td
                                                                key={key}
                                                                className="p-3 font-mono text-gray-300">
                                                                {Array.isArray(
                                                                    detection[
                                                                        key
                                                                    ]
                                                                )
                                                                    ? detection[
                                                                          key
                                                                      ].join(
                                                                          ', '
                                                                      )
                                                                    : detection[
                                                                          key
                                                                      ]}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
