'use client'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
    FiUpload,
    FiDownload,
    FiSearch,
    FiFilter,
    FiEye,
    FiAlertCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'

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

// Action options
const ACTION_OPTIONS = {
    CLOCK_IN: 'Clock In',
    CLOCK_OUT: 'Clock Out'
}

// User options
const USER_OPTIONS = ['John Doe', 'Jane Smith', 'Mike Johnson']

// Status options
const STATUS_OPTIONS = {
    PENDING: {
        label: 'Pending Review',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    APPROVED: {
        label: 'Approved',
        color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    REJECTED: {
        label: 'Rejected',
        color: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
}

export default function ShiftReports() {
    // Form state
    const [formData, setFormData] = useState({
        shift: '',
        action: '',
        fullName: '',
        screenshot: null,
        accomplishments: ''
    })

    // Table state
    const [reports, setReports] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShift, setSelectedShift] = useState('ALL')
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    })
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    })
    const [showReportDetails, setShowReportDetails] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [activeTab, setActiveTab] = useState('submit')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [showExportPreview, setShowExportPreview] = useState(false)

    // Calculate statistics
    const statistics = {
        totalReports: reports.length,
        totalClockIn: reports.filter(
            (report) => report.action === ACTION_OPTIONS.CLOCK_IN
        ).length,
        totalClockOut: reports.filter(
            (report) => report.action === ACTION_OPTIONS.CLOCK_OUT
        ).length,
        shifts: {
            morning: reports.filter(
                (report) => report.shift === SHIFT_OPTIONS.MORNING.label
            ).length,
            afternoon: reports.filter(
                (report) => report.shift === SHIFT_OPTIONS.AFTERNOON.label
            ).length,
            evening: reports.filter(
                (report) => report.shift === SHIFT_OPTIONS.EVENING.label
            ).length
        }
    }

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData((prev) => ({
                ...prev,
                screenshot: file
            }))
        }
    }

    // Validate form
    const validateForm = () => {
        const errors = {}

        if (!formData.shift) {
            errors.shift = 'Please select a shift'
        }
        if (!formData.action) {
            errors.action = 'Please select an action'
        }
        if (!formData.fullName) {
            errors.fullName = 'Please select your name'
        }
        if (!formData.screenshot) {
            errors.screenshot = 'Please upload a screenshot'
        }
        if (
            formData.action === ACTION_OPTIONS.CLOCK_OUT &&
            !formData.accomplishments
        ) {
            errors.accomplishments = 'Please provide your daily accomplishments'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fill in all required fields', {
                style: {
                    background: '#1e293b',
                    color: '#f87171',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
                    fontFamily: 'monospace'
                }
            })
            return
        }

        setShowConfirmation(true)
    }

    // Handle confirmed submission
    const handleConfirmedSubmit = () => {
        // Create new report
        const newReport = {
            id: Date.now(),
            ...formData,
            date: new Date().toISOString(),
            status: 'PENDING'
        }

        // Add to reports list
        setReports((prev) => [newReport, ...prev])

        // Reset form
        setFormData({
            shift: '',
            action: '',
            fullName: '',
            screenshot: null,
            accomplishments: ''
        })

        setShowConfirmation(false)
        setActiveTab('tracking')

        toast.success('Shift report submitted successfully', {
            style: {
                background: '#1e293b',
                color: '#22d3ee',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                fontFamily: 'monospace'
            }
        })
    }

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Sort reports
    const sortedReports = [...reports].sort((a, b) => {
        if (!sortConfig.key) return 0

        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc'
                ? new Date(aValue) - new Date(bValue)
                : new Date(bValue) - new Date(aValue)
        }

        return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))
    })

    // Filter reports
    const filteredReports = sortedReports.filter((report) => {
        const matchesSearch = Object.values(report).some((value) =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
        const matchesShift =
            selectedShift === 'ALL' || report.shift === selectedShift
        const matchesStatus =
            selectedStatus === 'ALL' || report.status === selectedStatus
        const matchesDateRange =
            (!dateRange.start ||
                new Date(report.date) >= new Date(dateRange.start)) &&
            (!dateRange.end || new Date(report.date) <= new Date(dateRange.end))

        return (
            matchesSearch && matchesShift && matchesStatus && matchesDateRange
        )
    })

    // Export functions
    const exportToCSV = () => {
        const headers = [
            'Date',
            'Shift',
            'Action',
            'Full Name',
            'Status',
            'Accomplishments'
        ]
        const rows = filteredReports.map((report) => [
            format(new Date(report.date), 'yyyy-MM-dd HH:mm'),
            report.shift,
            report.action,
            report.fullName,
            STATUS_OPTIONS[report.status].label,
            report.accomplishments
        ])

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'shift-reports.csv'
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

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                            Shift Reports
                        </h1>
                        <p className="text-gray-400 mt-2 font-mono">
                            Submit and track your shift activities
                        </p>
                    </div>
                    {activeTab === 'tracking' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowExportPreview(true)}
                                className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                         rounded-md text-gray-300 hover:bg-gray-800/70 
                                         transition-colors duration-200 flex items-center gap-2">
                                <FiDownload />
                                Export
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('submit')}
                        className={`px-6 py-2 rounded-md font-mono transition-all duration-300 ${
                            activeTab === 'submit'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
                        }`}>
                        Submit Report
                    </button>
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`px-6 py-2 rounded-md font-mono transition-all duration-300 ${
                            activeTab === 'tracking'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-cyan-300'
                        }`}>
                        Activity Tracking
                    </button>
                </div>

                {/* Submit Report Form */}
                {activeTab === 'submit' && (
                    <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 p-6 mb-8">
                        <h2 className="text-lg font-mono text-cyan-300 mb-4">
                            Submit Shift Report
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Shift/Activity
                                    </label>
                                    <select
                                        name="shift"
                                        value={formData.shift}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-gray-800/50 border ${
                                            formErrors.shift
                                                ? 'border-red-500/50'
                                                : 'border-cyan-500/20'
                                        } rounded-md text-gray-300 font-mono
                                        focus:outline-none focus:border-cyan-500/50`}>
                                        <option value="">Select Shift</option>
                                        {Object.entries(SHIFT_OPTIONS).map(
                                            ([key, { label }]) => (
                                                <option key={key} value={label}>
                                                    {label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {formErrors.shift && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <FiAlertCircle />
                                            {formErrors.shift}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Action
                                    </label>
                                    <select
                                        name="action"
                                        value={formData.action}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-gray-800/50 border ${
                                            formErrors.action
                                                ? 'border-red-500/50'
                                                : 'border-cyan-500/20'
                                        } rounded-md text-gray-300 font-mono
                                        focus:outline-none focus:border-cyan-500/50`}>
                                        <option value="">Select Action</option>
                                        {Object.entries(ACTION_OPTIONS).map(
                                            ([key, value]) => (
                                                <option key={key} value={value}>
                                                    {value}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    {formErrors.action && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <FiAlertCircle />
                                            {formErrors.action}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Full Name
                                    </label>
                                    <select
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-gray-800/50 border ${
                                            formErrors.fullName
                                                ? 'border-red-500/50'
                                                : 'border-cyan-500/20'
                                        } rounded-md text-gray-300 font-mono
                                        focus:outline-none focus:border-cyan-500/50`}>
                                        <option value="">Select Name</option>
                                        {USER_OPTIONS.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.fullName && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <FiAlertCircle />
                                            {formErrors.fullName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-1">
                                    Screenshot Upload
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="screenshot-upload"
                                    />
                                    <label
                                        htmlFor="screenshot-upload"
                                        className={`px-4 py-2 bg-gray-800/50 border ${
                                            formErrors.screenshot
                                                ? 'border-red-500/50'
                                                : 'border-cyan-500/20'
                                        } rounded-md text-gray-300 hover:bg-gray-800/70 
                                        transition-colors duration-200 flex items-center gap-2 cursor-pointer`}>
                                        <FiUpload />
                                        {formData.screenshot
                                            ? 'Change Screenshot'
                                            : 'Upload Screenshot'}
                                    </label>
                                    {formData.screenshot && (
                                        <span className="text-sm text-gray-400 font-mono">
                                            {formData.screenshot.name}
                                        </span>
                                    )}
                                </div>
                                {formErrors.screenshot && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                        <FiAlertCircle />
                                        {formErrors.screenshot}
                                    </p>
                                )}
                                <p className="text-sm text-gray-400 mt-1 font-mono">
                                    {formData.action === ACTION_OPTIONS.CLOCK_IN
                                        ? '(Clock In) Require an uploaded screenshot from the Stellar Cyber Platform showing the time and date.'
                                        : formData.action ===
                                          ACTION_OPTIONS.CLOCK_OUT
                                        ? '(Clock Out) Require an uploaded screenshot of the report showing the time and date.'
                                        : 'Please select an action to see screenshot requirements.'}
                                </p>
                            </div>

                            {formData.action === ACTION_OPTIONS.CLOCK_OUT && (
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Accomplishments for the Day
                                    </label>
                                    <textarea
                                        name="accomplishments"
                                        value={formData.accomplishments}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`w-full px-4 py-2 bg-gray-800/50 border ${
                                            formErrors.accomplishments
                                                ? 'border-red-500/50'
                                                : 'border-cyan-500/20'
                                        } rounded-md text-gray-300 font-mono
                                        focus:outline-none focus:border-cyan-500/50`}
                                        placeholder="Describe your daily accomplishments..."
                                    />
                                    {formErrors.accomplishments && (
                                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                            <FiAlertCircle />
                                            {formErrors.accomplishments}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="px-6 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 
                                         rounded-md hover:bg-cyan-500/30 transition-colors duration-200
                                         font-mono flex items-center gap-2">
                                Submit Report
                            </button>
                        </form>
                    </div>
                )}

                {/* Activity Tracking Section */}
                {activeTab === 'tracking' && (
                    <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
                        <div className="p-4 border-b border-cyan-500/20">
                            <h2 className="text-lg font-mono text-cyan-300">
                                Activity Tracking
                            </h2>
                        </div>

                        {/* Statistics */}
                        <div className="p-4 border-b border-cyan-500/20">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20">
                                    <h3 className="text-sm font-mono text-gray-400 mb-1">
                                        Total Reports
                                    </h3>
                                    <p className="text-2xl font-mono text-cyan-300">
                                        {statistics.totalReports}
                                    </p>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20">
                                    <h3 className="text-sm font-mono text-gray-400 mb-1">
                                        Clock In
                                    </h3>
                                    <p className="text-2xl font-mono text-green-400">
                                        {statistics.totalClockIn}
                                    </p>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20">
                                    <h3 className="text-sm font-mono text-gray-400 mb-1">
                                        Clock Out
                                    </h3>
                                    <p className="text-2xl font-mono text-blue-400">
                                        {statistics.totalClockOut}
                                    </p>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-cyan-500/20">
                                    <h3 className="text-sm font-mono text-gray-400 mb-1">
                                        Total Shifts
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-sm font-mono text-blue-400">
                                            Morning: {statistics.shifts.morning}
                                        </p>
                                        <p className="text-sm font-mono text-yellow-400">
                                            Afternoon:{' '}
                                            {statistics.shifts.afternoon}
                                        </p>
                                        <p className="text-sm font-mono text-purple-400">
                                            Evening: {statistics.shifts.evening}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-4 border-b border-cyan-500/20">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                                 rounded-md text-gray-300 placeholder-gray-500 font-mono
                                                 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                                <select
                                    value={selectedShift}
                                    onChange={(e) =>
                                        setSelectedShift(e.target.value)
                                    }
                                    className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                             rounded-md text-gray-300 font-mono
                                             focus:outline-none focus:border-cyan-500/50">
                                    <option value="ALL">All Shifts</option>
                                    {Object.entries(SHIFT_OPTIONS).map(
                                        ([key, { label }]) => (
                                            <option key={key} value={label}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                             rounded-md text-gray-300 font-mono
                                             focus:outline-none focus:border-cyan-500/50">
                                    <option value="ALL">All Statuses</option>
                                    {Object.entries(STATUS_OPTIONS).map(
                                        ([key, { label }]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({
                                                ...prev,
                                                start: e.target.value
                                            }))
                                        }
                                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                                 rounded-md text-gray-300 font-mono
                                                 focus:outline-none focus:border-cyan-500/50"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({
                                                ...prev,
                                                end: e.target.value
                                            }))
                                        }
                                        className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                                 rounded-md text-gray-300 font-mono
                                                 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-800/70">
                                        <th
                                            className="p-3 text-center font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                            onClick={() => handleSort('date')}>
                                            Date
                                            {sortConfig.key === 'date' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction ===
                                                    'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th
                                            className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                            onClick={() => handleSort('shift')}>
                                            Shift
                                            {sortConfig.key === 'shift' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction ===
                                                    'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th
                                            className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                            onClick={() =>
                                                handleSort('action')
                                            }>
                                            Action
                                            {sortConfig.key === 'action' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction ===
                                                    'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th
                                            className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                            onClick={() =>
                                                handleSort('fullName')
                                            }>
                                            Full Name
                                            {sortConfig.key === 'fullName' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction ===
                                                    'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th
                                            className="p-3 text-left font-mono text-gray-400 cursor-pointer hover:text-cyan-400"
                                            onClick={() =>
                                                handleSort('status')
                                            }>
                                            Status
                                            {sortConfig.key === 'status' && (
                                                <span className="ml-1">
                                                    {sortConfig.direction ===
                                                    'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th className="p-3 text-left font-mono text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="border-t border-gray-700/50">
                                            <td className="p-3 font-mono">
                                                {format(
                                                    new Date(report.date),
                                                    'MMMM d, yyyy hh:mma'
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                        Object.entries(
                                                            SHIFT_OPTIONS
                                                        ).find(
                                                            ([_, { label }]) =>
                                                                label ===
                                                                report.shift
                                                        )?.[1].color
                                                    }`}>
                                                    {report.shift}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono">
                                                {report.action}
                                            </td>
                                            <td className="p-3 font-mono">
                                                {report.fullName}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                        STATUS_OPTIONS[
                                                            report.status
                                                        ].color
                                                    }`}>
                                                    {
                                                        STATUS_OPTIONS[
                                                            report.status
                                                        ].label
                                                    }
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReport(
                                                            report
                                                        )
                                                        setShowReportDetails(
                                                            true
                                                        )
                                                    }}
                                                    className="text-cyan-400 hover:text-cyan-300">
                                                    <FiEye className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Preview Modal */}
            {showExportPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
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
                                    className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                             rounded-md text-gray-300 hover:bg-gray-800/70 
                                             transition-colors duration-200 flex items-center gap-2">
                                    <FiDownload />
                                    Export CSV
                                </button>
                                <button
                                    onClick={exportToExcel}
                                    className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                             rounded-md text-gray-300 hover:bg-gray-800/70 
                                             transition-colors duration-200 flex items-center gap-2">
                                    <FiDownload />
                                    Export Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-4 py-2 bg-gray-800/50 border border-cyan-500/20 
                                             rounded-md text-gray-300 hover:bg-gray-800/70 
                                             transition-colors duration-200 flex items-center gap-2">
                                    <FiDownload />
                                    Export PDF
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-800/70">
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Date
                                            </th>
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Shift
                                            </th>
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Action
                                            </th>
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Full Name
                                            </th>
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Status
                                            </th>
                                            <th className="p-3 text-left font-mono text-gray-400">
                                                Accomplishments
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports
                                            .slice(0, 5)
                                            .map((report) => (
                                                <tr
                                                    key={report.id}
                                                    className="border-t border-gray-700/50">
                                                    <td className="p-3 font-mono">
                                                        {format(
                                                            new Date(
                                                                report.date
                                                            ),
                                                            'MMMM d, yyyy hh:mma'
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-mono">
                                                        {report.shift}
                                                    </td>
                                                    <td className="p-3 font-mono">
                                                        {report.action}
                                                    </td>
                                                    <td className="p-3 font-mono">
                                                        {report.fullName}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-md text-xs font-mono ${
                                                                STATUS_OPTIONS[
                                                                    report
                                                                        .status
                                                                ].color
                                                            }`}>
                                                            {
                                                                STATUS_OPTIONS[
                                                                    report
                                                                        .status
                                                                ].label
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-mono">
                                                        {report.accomplishments}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-gray-400 font-mono">
                                Showing first 5 records of{' '}
                                {filteredReports.length} total records
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Details Modal */}
            {showReportDetails && selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-mono text-cyan-300">
                                Report Details
                            </h3>
                            <button
                                onClick={() => setShowReportDetails(false)}
                                className="text-gray-400 hover:text-gray-300">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Date
                                    </label>
                                    <p className="font-mono text-gray-300">
                                        {format(
                                            new Date(selectedReport.date),
                                            'MMMM d, yyyy hh:mma'
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Shift
                                    </label>
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-mono ${
                                            Object.entries(SHIFT_OPTIONS).find(
                                                ([_, { label }]) =>
                                                    label ===
                                                    selectedReport.shift
                                            )?.[1].color
                                        }`}>
                                        {selectedReport.shift}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Action
                                    </label>
                                    <p className="font-mono text-gray-300">
                                        {selectedReport.action}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Full Name
                                    </label>
                                    <p className="font-mono text-gray-300">
                                        {selectedReport.fullName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-mono text-gray-400 mb-1">
                                        Status
                                    </label>
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-mono ${
                                            STATUS_OPTIONS[
                                                selectedReport.status
                                            ].color
                                        }`}>
                                        {
                                            STATUS_OPTIONS[
                                                selectedReport.status
                                            ].label
                                        }
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-1">
                                    Accomplishments
                                </label>
                                <p className="font-mono text-gray-300 whitespace-pre-wrap">
                                    {selectedReport.accomplishments}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-mono text-gray-400 mb-1">
                                    Screenshot
                                </label>
                                {selectedReport.screenshot && (
                                    <img
                                        src={URL.createObjectURL(
                                            selectedReport.screenshot
                                        )}
                                        alt="Screenshot"
                                        className="max-w-full h-auto rounded-md"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-mono text-cyan-300 mb-4">
                            Confirm Submission
                        </h3>
                        <p className="text-gray-300 font-mono mb-6">
                            Are you sure you want to submit this shift report?
                            Please verify all information is correct.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-gray-400 hover:text-gray-300 font-mono">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmedSubmit}
                                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 
                                         rounded-md hover:bg-cyan-500/30 transition-colors duration-200
                                         font-mono">
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
