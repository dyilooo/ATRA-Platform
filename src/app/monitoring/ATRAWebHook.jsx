'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

// Status options for alerts
const STATUS_OPTIONS = {
    NEW: {
        label: 'New',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    CLOSED: {
        label: 'Closed',
        color: 'bg-green-500/20 text-green-400 border-green-500/30'
    }
}

// Severity configuration
const SEVERITY_OPTIONS = {
    HIGH: {
        label: 'High (Critical)',
        color: 'bg-red-700/20 text-red-500 border-red-700/30',
        threshold: 75
    },
    MEDIUM: {
        label: 'Medium (Major)',
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        threshold: 50
    },
    LOW: {
        label: 'Low (Minor)',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        threshold: 25
    },
    LOWEST: {
        label: 'Lowest (Notice)',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        threshold: 0
    }
}

// Get severity level based on score
const getSeverityLevel = (score) => {
    if (score >= SEVERITY_OPTIONS.HIGH.threshold) return 'HIGH'
    if (score >= SEVERITY_OPTIONS.MEDIUM.threshold) return 'MEDIUM'
    if (score >= SEVERITY_OPTIONS.LOW.threshold) return 'LOW'
    return 'LOWEST'
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

// Alert status options with colors
const ALERT_STATUS_OPTIONS = {
    TRUE_POSITIVE: {
        label: 'True Positive',
        color: 'bg-red-800/20 text-red-600 border-red-800/30'
    },
    FALSE_POSITIVE: {
        label: 'False Positive',
        color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    TO_BE_CONFIRMED: {
        label: 'To Be Confirmed',
        color: 'bg-red-400/20 text-red-300 border-red-400/30'
    }
}

// Shift order for sorting
const SHIFT_ORDER = {
    Morning: 1,
    Afternoon: 2,
    Evening: 3
}

export default function ATRALegacyWebHook() {
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            timestamp: '2023-10-01T12:00:00Z',
            shift: 'Morning',
            detectedBy: 'Clifford Uson',
            status: 'NEW',
            alertStatus: null,
            severityScore: 80,
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
            alertStatus: null,
            severityScore: 60,
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
            alertStatus: null,
            severityScore: 30,
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
    const [sortConfig, setSortConfig] = useState({
        key: 'timestamp',
        direction: 'desc'
    })
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterTenant, setFilterTenant] = useState('ALL')
    const [filterShift, setFilterShift] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedAlertId, setExpandedAlertId] = useState(null)
    const [tempAlert, setTempAlert] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [showColumnSettings, setShowColumnSettings] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState({
        timestamp: true,
        status: true,
        alertStatus: true,
        severityScore: true,
        stage: true,
        alertType: true,
        technique: true,
        srcIP: true,
        srcIPType: true,
        srcGeoCode: true,
        destinationIP: true,
        dstIPType: true,
        dstGeoCode: true,
        sourceHost: true,
        description: true,
        links: true
    })

    // Calculate totals
    const totals = {
        status: {},
        alertStatus: { null: 0 },
        severity: {}
    }

    const filteredAndSortedAlerts = alerts
        .filter((alert) => {
            const matchesStatus =
                filterStatus === 'ALL' || alert.status === filterStatus
            const matchesTenant =
                filterTenant === 'ALL' || alert.tenant === filterTenant
            const matchesShift =
                filterShift === 'ALL' || alert.shift === filterShift
            const matchesSearch =
                searchQuery === '' ||
                Object.values(alert).some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            return (
                matchesStatus && matchesTenant && matchesShift && matchesSearch
            )
        })
        .sort((a, b) => {
            if (sortConfig.key === 'timestamp') {
                return sortConfig.direction === 'asc'
                    ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
                    : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key])
            }
            if (sortConfig.key === 'shift') {
                const shiftOrderA = SHIFT_ORDER[a.shift] || 0
                const shiftOrderB = SHIFT_ORDER[b.shift] || 0
                return sortConfig.direction === 'asc'
                    ? shiftOrderA - shiftOrderB
                    : shiftOrderB - shiftOrderA
            }
            return sortConfig.direction === 'asc'
                ? a[sortConfig.key] > b[sortConfig.key]
                    ? 1
                    : -1
                : b[sortConfig.key] > a[sortConfig.key]
                ? 1
                : -1
        })

    filteredAndSortedAlerts.forEach((alert) => {
        // Status totals
        totals.status[alert.status] = (totals.status[alert.status] || 0) + 1

        // Alert status totals
        if (alert.alertStatus) {
            totals.alertStatus[alert.alertStatus] =
                (totals.alertStatus[alert.alertStatus] || 0) + 1
        } else {
            totals.alertStatus.null++
        }

        // Severity totals
        const severityLevel = getSeverityLevel(alert.severityScore)
        totals.severity[severityLevel] =
            (totals.severity[severityLevel] || 0) + 1
    })

    // Preview data generation
    const generatePreviewData = () => {
        const headers = columnDefinitions
            .filter(({ key }) => visibleColumns[key])
            .map(({ label }) => label)

        const previewData = filteredAndSortedAlerts.slice(0, 5).map((alert) => {
            const rowData = {}
            if (visibleColumns.timestamp) {
                rowData.timestamp = format(
                    new Date(alert.timestamp),
                    'MMMM d, yyyy hh:mma'
                )
            }
            if (visibleColumns.status) {
                rowData.status = {
                    label: STATUS_OPTIONS[alert.status].label,
                    color: STATUS_OPTIONS[alert.status].color
                }
            }
            if (visibleColumns.alertStatus) {
                rowData.alertStatus = alert.alertStatus
                    ? {
                          label: ALERT_STATUS_OPTIONS[alert.alertStatus].label,
                          color: ALERT_STATUS_OPTIONS[alert.alertStatus].color
                      }
                    : null
            }
            if (visibleColumns.severityScore) {
                const severityLevel = getSeverityLevel(alert.severityScore)
                rowData.severity = {
                    label: `${SEVERITY_OPTIONS[severityLevel].label} (${alert.severityScore})`,
                    color: SEVERITY_OPTIONS[severityLevel].color
                }
            }
            if (visibleColumns.stage) rowData.stage = alert.stage
            if (visibleColumns.alertType) rowData.alertType = alert.alertType
            if (visibleColumns.technique) rowData.technique = alert.technique
            if (visibleColumns.srcIP) rowData.srcIP = alert.srcIP
            if (visibleColumns.srcIPType) rowData.srcIPType = alert.srcIPType
            if (visibleColumns.srcGeoCode) rowData.srcGeoCode = alert.srcGeoCode
            if (visibleColumns.destinationIP)
                rowData.destinationIP = alert.destinationIP
            if (visibleColumns.dstIPType) rowData.dstIPType = alert.dstIPType
            if (visibleColumns.dstGeoCode) rowData.dstGeoCode = alert.dstGeoCode
            if (visibleColumns.sourceHost) rowData.sourceHost = alert.sourceHost
            if (visibleColumns.description)
                rowData.description = alert.description
            if (visibleColumns.links) rowData.links = alert.links
            return rowData
        })

        return {
            headers,
            data: previewData,
            totalCount: filteredAndSortedAlerts.length
        }
    }

    // Update alert details
    const updateAlert = (alertId, updatedFields) => {
        setAlerts(
            alerts.map((alert) =>
                alert.id === alertId ? { ...alert, ...updatedFields } : alert
            )
        )
        toast.success('Alert updated successfully')
        setExpandedAlertId(null) // Collapse section after saving
    }

    // Sorting function
    const handleSort = (key) => {
        setSortConfig({
            key,
            direction:
                sortConfig.key === key && sortConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc'
        })
    }

    // Update temporary alert details
    const handleTempAlertChange = (field, value) => {
        setTempAlert((prev) => ({ ...prev, [field]: value }))
    }

    // Save changes from temporary alert to main alerts state
    const saveAlertChanges = (alertId) => {
        updateAlert(alertId, tempAlert)
        setTempAlert(null) // Clear temporary state after saving
    }

    // Export to CSV function
    const exportToCSV = () => {
        const { headers, data } = generatePreviewData()
        const csvData = data.map((row) =>
            Object.values(row).map((value) => {
                if (value === null) return ''
                if (typeof value === 'object' && value.label) return value.label
                return value
            })
        )

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) =>
                row.map((cell) => `"${cell || ''}"`).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute(
            'download',
            `alerts_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
        )
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Export completed successfully')
    }

    // Column definitions
    const columnDefinitions = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'status', label: 'Status' },
        { key: 'alertStatus', label: 'Alert Status' },
        { key: 'severityScore', label: 'Severity' },
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
    ]

    // Toggle column visibility
    const toggleColumn = (columnKey) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }))
    }

    // Show/Hide all columns
    const toggleAllColumns = (value) => {
        const newVisibility = {}
        columnDefinitions.forEach(({ key }) => {
            newVisibility[key] = value
        })
        setVisibleColumns(newVisibility)
    }

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                            Monitoring Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2 font-mono">
                            Total Detections: {filteredAndSortedAlerts.length}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {/* Status Totals */}
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                                <h3 className="text-sm font-mono text-gray-400 mb-2">
                                    Status Totals
                                </h3>
                                <div className="space-y-1">
                                    {Object.entries(totals.status).map(
                                        ([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex justify-between items-center">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${STATUS_OPTIONS[status].color}`}>
                                                    {
                                                        STATUS_OPTIONS[status]
                                                            .label
                                                    }
                                                </span>
                                                <span className="font-mono">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Alert Status Totals */}
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                                <h3 className="text-sm font-mono text-gray-400 mb-2">
                                    Alert Status Totals
                                </h3>
                                <div className="space-y-1">
                                    {Object.entries(totals.alertStatus).map(
                                        ([status, count]) => (
                                            <div
                                                key={status}
                                                className="flex justify-between items-center">
                                                {status === 'null' ? (
                                                    <span className="text-gray-400 text-xs font-mono">
                                                        Not Set
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`px-2 py-1 rounded-md text-xs font-mono ${ALERT_STATUS_OPTIONS[status].color}`}>
                                                        {
                                                            ALERT_STATUS_OPTIONS[
                                                                status
                                                            ].label
                                                        }
                                                    </span>
                                                )}
                                                <span className="font-mono">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Severity Totals */}
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                                <h3 className="text-sm font-mono text-gray-400 mb-2">
                                    Severity Totals
                                </h3>
                                <div className="space-y-1">
                                    {Object.entries(totals.severity).map(
                                        ([severity, count]) => (
                                            <div
                                                key={severity}
                                                className="flex justify-between items-center">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${SEVERITY_OPTIONS[severity].color}`}>
                                                    {
                                                        SEVERITY_OPTIONS[
                                                            severity
                                                        ].label
                                                    }
                                                </span>
                                                <span className="font-mono">
                                                    {count}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowColumnSettings(!showColumnSettings)
                                }
                                title="Configure which columns to display in the table"
                                className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-md 
                                hover:bg-gray-500/30 transition-all duration-300 font-mono
                                border border-gray-500/30 text-sm">
                                Column Settings
                            </button>
                            {showColumnSettings && (
                                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-mono text-gray-300">
                                                Toggle Columns
                                            </h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        toggleAllColumns(true)
                                                    }
                                                    className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-md 
                                                    hover:bg-cyan-500/30 transition-all duration-300 font-mono">
                                                    Show All
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        toggleAllColumns(false)
                                                    }
                                                    className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded-md 
                                                    hover:bg-gray-500/30 transition-all duration-300 font-mono">
                                                    Hide All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {columnDefinitions.map(
                                                ({ key, label }) => (
                                                    <label
                                                        key={key}
                                                        className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                visibleColumns[
                                                                    key
                                                                ]
                                                            }
                                                            onChange={() =>
                                                                toggleColumn(
                                                                    key
                                                                )
                                                            }
                                                            className="rounded bg-gray-700 border-gray-600"
                                                        />
                                                        <span className="text-gray-300 font-mono">
                                                            {label}
                                                        </span>
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPreview(true)}
                            title="Preview data and export to CSV format"
                            className="px-4 py-2 bg-green-500/20 text-green-300 rounded-md 
                            hover:bg-green-500/30 transition-all duration-300 font-mono
                            border border-green-500/30 text-sm">
                            Preview & Export
                        </button>
                        <button
                            onClick={() => {
                                // Implement refresh logic
                            }}
                            title="Refresh data to get latest updates"
                            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                     hover:bg-cyan-500/30 transition-all duration-300 font-mono
                            border border-cyan-500/30 text-sm">
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
                        title="Filter alerts by their current status"
                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                     rounded-md text-gray-300 font-mono
                     focus:outline-none focus:border-cyan-500/50">
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_OPTIONS).map(
                            ([status, { label }]) => (
                                <option key={status} value={status}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                    <select
                        value={filterShift}
                        onChange={(e) => setFilterShift(e.target.value)}
                        title="Filter alerts by shift schedule"
                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                     rounded-md text-gray-300 font-mono
                     focus:outline-none focus:border-cyan-500/50">
                        <option value="ALL">All Shifts</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                    </select>
                    <select
                        value={filterTenant}
                        onChange={(e) => setFilterTenant(e.target.value)}
                        title="Filter alerts by tenant organization"
                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                     rounded-md text-gray-300 font-mono
                     focus:outline-none focus:border-cyan-500/50">
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
                                    {columnDefinitions.map(({ key, label }) =>
                                        visibleColumns[key] ? (
                                            <th
                                                key={key}
                                                onClick={() => handleSort(key)}
                                                className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400">
                                                <div className="flex items-center gap-2">
                                                    {label}
                                                    {sortConfig.key === key && (
                                                        <span>
                                                            {sortConfig.direction ===
                                                            'asc'
                                                                ? '↑'
                                                                : '↓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ) : null
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                Object.values(
                                                    visibleColumns
                                                ).filter(Boolean).length
                                            }
                                            className="p-4 text-center font-mono text-gray-400">
                                            Loading alerts...
                                        </td>
                                    </tr>
                                ) : filteredAndSortedAlerts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                Object.values(
                                                    visibleColumns
                                                ).filter(Boolean).length
                                            }
                                            className="p-4 text-center font-mono text-gray-400">
                                            No alerts found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedAlerts.map((alert) => (
                                        <React.Fragment key={alert.id}>
                                            <tr
                                                className="border-t border-gray-700/50"
                                                onClick={() => {
                                                    setExpandedAlertId(
                                                        expandedAlertId ===
                                                            alert.id
                                                            ? null
                                                            : alert.id
                                                    )
                                                    setTempAlert(alert)
                                                }}>
                                                {visibleColumns.timestamp && (
                                                    <td className="p-3 font-mono">
                                                        {format(
                                                            new Date(
                                                                alert.timestamp
                                                            ),
                                                            'MMMM d, yyyy hh:mma'
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                                STATUS_OPTIONS[
                                                                    alert.status
                                                                ].color
                                                            }`}>
                                                            {
                                                                STATUS_OPTIONS[
                                                                    alert.status
                                                                ].label
                                                            }
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.alertStatus && (
                                                    <td className="p-3 font-mono">
                                                        {alert.alertStatus ? (
                                                            <span
                                                                className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                                    ALERT_STATUS_OPTIONS[
                                                                        alert
                                                                            .alertStatus
                                                                    ].color
                                                                }`}>
                                                                {
                                                                    ALERT_STATUS_OPTIONS[
                                                                        alert
                                                                            .alertStatus
                                                                    ].label
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {visibleColumns.severityScore && (
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                                SEVERITY_OPTIONS[
                                                                    getSeverityLevel(
                                                                        alert.severityScore
                                                                    )
                                                                ].color
                                                            }`}>
                                                            {
                                                                SEVERITY_OPTIONS[
                                                                    getSeverityLevel(
                                                                        alert.severityScore
                                                                    )
                                                                ].label
                                                            }{' '}
                                                            (
                                                            {
                                                                alert.severityScore
                                                            }
                                                            )
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.stage && (
                                                    <td className="p-3 font-mono">
                                                        {alert.stage}
                                                    </td>
                                                )}
                                                {visibleColumns.alertType && (
                                                    <td className="p-3 font-mono">
                                                        {alert.alertType}
                                                    </td>
                                                )}
                                                {visibleColumns.technique && (
                                                    <td className="p-3 font-mono">
                                                        {alert.technique}
                                                    </td>
                                                )}
                                                {visibleColumns.srcIP && (
                                                    <td className="p-3 font-mono">
                                                        {alert.srcIP}
                                                    </td>
                                                )}
                                                {visibleColumns.srcIPType && (
                                                    <td className="p-3 font-mono">
                                                        {alert.srcIPType}
                                                    </td>
                                                )}
                                                {visibleColumns.srcGeoCode && (
                                                    <td className="p-3 font-mono">
                                                        {alert.srcGeoCode}
                                                    </td>
                                                )}
                                                {visibleColumns.destinationIP && (
                                                    <td className="p-3 font-mono">
                                                        {alert.destinationIP}
                                                    </td>
                                                )}
                                                {visibleColumns.dstIPType && (
                                                    <td className="p-3 font-mono">
                                                        {alert.dstIPType}
                                                    </td>
                                                )}
                                                {visibleColumns.dstGeoCode && (
                                                    <td className="p-3 font-mono">
                                                        {alert.dstGeoCode}
                                                    </td>
                                                )}
                                                {visibleColumns.sourceHost && (
                                                    <td className="p-3 font-mono">
                                                        {alert.sourceHost}
                                                    </td>
                                                )}
                                                {visibleColumns.description && (
                                                    <td className="p-3 font-mono">
                                                        {alert.description}
                                                    </td>
                                                )}
                                                {visibleColumns.links && (
                                                    <td className="p-3">
                                                        <a
                                                            href={alert.links}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-cyan-400 hover:underline">
                                                            View
                                                        </a>
                                                    </td>
                                                )}
                                            </tr>
                                            {expandedAlertId === alert.id && (
                                                <tr className="bg-gray-800/70">
                                                    <td
                                                        colSpan={
                                                            Object.values(
                                                                visibleColumns
                                                            ).filter(Boolean)
                                                                .length
                                                        }
                                                        className="p-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-gray-300">
                                                                    Shift
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        tempAlert.shift
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTempAlertChange(
                                                                            'shift',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-300">
                                                                    Detected By
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        tempAlert.detectedBy
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTempAlertChange(
                                                                            'detectedBy',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-300">
                                                                    Status
                                                                </label>
                                                                <select
                                                                    value={
                                                                        tempAlert.status
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTempAlertChange(
                                                                            'status',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50">
                                                                    {Object.entries(
                                                                        STATUS_OPTIONS
                                                                    ).map(
                                                                        ([
                                                                            status,
                                                                            {
                                                                                label
                                                                            }
                                                                        ]) => (
                                                                            <option
                                                                                key={
                                                                                    status
                                                                                }
                                                                                value={
                                                                                    status
                                                                                }>
                                                                                {
                                                                                    label
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-300">
                                                                    Alert Status
                                                                </label>
                                                                <select
                                                                    value={
                                                                        tempAlert.alertStatus ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTempAlertChange(
                                                                            'alertStatus',
                                                                            e
                                                                                .target
                                                                                .value ||
                                                                                null
                                                                        )
                                                                    }
                                                                    className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                                                             rounded-md text-gray-300 font-mono text-sm
                                                                             focus:outline-none focus:border-cyan-500/50">
                                                                    <option value="">
                                                                        Not Set
                                                                    </option>
                                                                    {Object.entries(
                                                                        ALERT_STATUS_OPTIONS
                                                                    ).map(
                                                                        ([
                                                                            status,
                                                                            {
                                                                                label
                                                                            }
                                                                        ]) => (
                                                                            <option
                                                                                key={
                                                                                    status
                                                                                }
                                                                                value={
                                                                                    status
                                                                                }>
                                                                                {
                                                                                    label
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-300">
                                                                    Remarks
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        tempAlert.remarks
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleTempAlertChange(
                                                                            'remarks',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full px-2 py-1 bg-gray-700/50 border border-cyan-500/20 
                                           rounded-md text-gray-300 font-mono text-sm
                                           focus:outline-none focus:border-cyan-500/50"
                                                                />
                                                            </div>
                                                            <div className="col-span-2 mt-4">
                                                                <button
                                                                    onClick={() =>
                                                                        saveAlertChanges(
                                                                            alert.id
                                                                        )
                                                                    }
                                                                    className="w-full px-4 py-2 bg-cyan-500 text-cyan-900 rounded-md 
                                           hover:bg-cyan-600 transition-all duration-300 font-mono
                                           border border-cyan-500 text-sm">
                                                                    Save Changes
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

                {/* CSV Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-mono">
                                        CSV Export Preview
                                    </h2>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <p className="text-sm text-gray-400 font-mono">
                                            Showing first 5 records of{' '}
                                            {filteredAndSortedAlerts.length}{' '}
                                            total
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            Note: CSV export will include all{' '}
                                            {filteredAndSortedAlerts.length}{' '}
                                            records
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={exportToCSV}
                                        className="px-4 py-2 bg-green-500/20 text-green-300 rounded-md 
                                        hover:bg-green-500/30 transition-all duration-300 font-mono
                                        border border-green-500/30 text-sm">
                                        Export All Records
                                    </button>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-md 
                                        hover:bg-red-500/30 transition-all duration-300 font-mono
                                        border border-red-500/30 text-sm">
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden border border-gray-700 rounded-lg">
                                <div className="overflow-x-auto">
                                    <div className="inline-block min-w-full align-middle">
                                        <div className="overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gray-700">
                                                    <tr>
                                                        {generatePreviewData().headers.map(
                                                            (header) => (
                                                                <th
                                                                    key={header}
                                                                    className="p-3 text-left text-xs font-mono text-gray-300 whitespace-nowrap">
                                                                    {header}
                                                                </th>
                                                            )
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                                    {generatePreviewData().data.map(
                                                        (row, index) => (
                                                            <tr
                                                                key={index}
                                                                className="hover:bg-gray-700/50">
                                                                {Object.values(
                                                                    row
                                                                ).map(
                                                                    (
                                                                        value,
                                                                        i
                                                                    ) => (
                                                                        <td
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="p-3 text-xs font-mono whitespace-nowrap">
                                                                            {typeof value ===
                                                                                'object' &&
                                                                            value !==
                                                                                null ? (
                                                                                value.label ? (
                                                                                    <span
                                                                                        className={`px-2 py-1 rounded-md text-xs font-mono ${value.color}`}>
                                                                                        {
                                                                                            value.label
                                                                                        }
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-gray-400">
                                                                                        -
                                                                                    </span>
                                                                                )
                                                                            ) : value ===
                                                                              null ? (
                                                                                <span className="text-gray-400">
                                                                                    -
                                                                                </span>
                                                                            ) : value.startsWith(
                                                                                  'http'
                                                                              ) ? (
                                                                                <a
                                                                                    href={
                                                                                        value
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-cyan-400 hover:underline">
                                                                                    View
                                                                                </a>
                                                                            ) : (
                                                                                value
                                                                            )}
                                                                        </td>
                                                                    )
                                                                )}
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
