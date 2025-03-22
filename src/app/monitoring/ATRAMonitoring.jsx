'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { fetchCases, fetchAlerts } from '@/services/stellar'
import { getAuthToken } from '@/services/auth'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export default function ATRAMonitoring() {
    const [loading, setLoading] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authCredentials, setAuthCredentials] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [cases, setCases] = useState([])
    const [casesError, setCasesError] = useState(null)
    const [casesLoading, setCasesLoading] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date()
        // Set to Manila timezone (UTC+8)
        return new Date(now.getTime() + (8 * 60 * 60 * 1000))
    })
    const [expandedCase, setExpandedCase] = useState(null)
    const [alerts, setAlerts] = useState({})
    const [alertsLoading, setAlertsLoading] = useState({})
    const [alertsError, setAlertsError] = useState({})

    // Extract unique tenants from cases
    const tenants = useMemo(() => {
        const tenantSet = new Set(cases.map(c => c.tenant_name).filter(Boolean));
        return ['all', ...Array.from(tenantSet)];
    }, [cases]);

    // Filter cases based on selected tenant and search query
    const filteredCases = useMemo(() => {
        return cases.filter(caseItem => {
            // Tenant filter
            if (selectedTenant !== 'all' && caseItem.tenant_name !== selectedTenant) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                return (
                    caseItem.name?.toLowerCase().includes(searchLower) ||
                    caseItem.ticket_id?.toString().includes(searchLower) ||
                    caseItem.severity?.toLowerCase().includes(searchLower) ||
                    caseItem.status?.toLowerCase().includes(searchLower) ||
                    caseItem.summary?.techniques?.some(t => t.toLowerCase().includes(searchLower)) ||
                    caseItem.summary?.tactics?.some(t => t.toLowerCase().includes(searchLower)) ||
                    caseItem.summary?.observables?.host?.values?.some(h => 
                        (h.hostname || h.value || '').toLowerCase().includes(searchLower) ||
                        (h.ip || '').toLowerCase().includes(searchLower)
                    ) ||
                    caseItem.summary?.observables?.user?.values?.some(u => 
                        (u.username || u.value || '').toLowerCase().includes(searchLower)
                    )
                );
            }

            return true;
        });
    }, [cases, selectedTenant, searchQuery]);

    // Function to handle date change
    const handleDateChange = (date) => {
        // Ensure the date is set to the start of the day in Manila timezone
        const manilaDate = new Date(date);
        manilaDate.setHours(0, 0, 0, 0);
        setSelectedDate(manilaDate);
        loadCases(manilaDate);
    };

    const loadCases = async (date = selectedDate) => {
        setCasesLoading(true)
        setCasesError(null)
        
        // Set to start of day in Manila timezone (UTC+8)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        
        // Set to end of day in Manila timezone (UTC+8)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        try {
            const result = await fetchCases({
                sort: 'created_at',      // Sort by creation date
                order: 'desc',           // Newest first
                limit: 1000,             // High limit to get all cases
                include_summary: true,
                format_summary: false,
                created_after: startOfDay.toISOString(),
                created_before: endOfDay.toISOString()
            });

            // Check if the response indicates authentication error
            if (result?.error === 'Authentication required' || result?.error?.includes('token')) {
                setShowAuthModal(true);
                localStorage.removeItem('stellar_token'); // Clear the invalid token
                setCasesError('Session expired. Please login again.');
                setCases([]);
                setCasesLoading(false);
                return;
            }

            console.log('Raw API Response:', result);
            console.log('Date range:', { 
                start: startOfDay.toISOString(), 
                end: endOfDay.toISOString(),
                phTime: format(date, 'yyyy-MM-dd HH:mm:ss')
            });

            if (result?.success && Array.isArray(result.data)) {
                // Filter cases to only include those from the selected date
                const casesForDate = result.data.filter(caseItem => {
                    const caseDate = new Date(caseItem.created_at);
                    return caseDate >= startOfDay && caseDate <= endOfDay;
                });

                // Sort cases by date in descending order (newest first)
                const sortedCases = casesForDate.sort((a, b) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    return dateB - dateA;
                });

                console.log('Total cases for selected date:', sortedCases.length);
                console.log('Date range:', {
                    start: format(startOfDay, 'yyyy-MM-dd HH:mm:ss'),
                    end: format(endOfDay, 'yyyy-MM-dd HH:mm:ss')
                });
                
                setCases(sortedCases);
            } else {
                console.error('Invalid response format:', result);
                setCasesError('Invalid response format from server');
                setCases([]);
            }
        } catch (error) {
            console.error('Error loading cases:', error);
            
            // Check if the error is related to authentication
            if (error.message === 'Authentication required' || 
                error.message?.includes('token') || 
                error.response?.status === 401) {
                setShowAuthModal(true);
                localStorage.removeItem('stellar_token'); // Clear the invalid token
                setCasesError('Session expired. Please login again.');
            } else {
                setCasesError(error.message || 'Error loading cases');
            }
            setCases([]);
        }
        
        setCasesLoading(false);
    }

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { success, token, error } = await getAuthToken(
            authCredentials.username,
            authCredentials.password
        )

        if (success && token) {
            localStorage.setItem('stellar_token', token)
            await loadCases() // Wait for cases to load
            setShowAuthModal(false)
        } else {
            toast.error(`Authentication failed: ${error || 'Invalid credentials'}`)
        }
        setLoading(false)
    }

    // Add auto-refresh interval
    useEffect(() => {
        // Function to check token and refresh data
        const checkAndRefresh = async () => {
            const token = localStorage.getItem('stellar_token');
            if (!token) {
                setShowAuthModal(true);
                return;
            }
            await loadCases();
        };

        // Initial load
        checkAndRefresh();

        // Set up interval to check every 5 minutes
        const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []); // Empty dependency array means this only runs once on mount

    // Function to fetch alerts for a specific case
    const loadAlerts = async (caseId) => {
        setAlertsLoading(prev => ({ ...prev, [caseId]: true }))
        setAlertsError(prev => ({ ...prev, [caseId]: null }))

        try {
            const result = await fetchAlerts(caseId, 0, 50) // Pass caseId along with skip and limit
            
            if (result?.success && Array.isArray(result.data)) {
                setAlerts(prev => ({ 
                    ...prev, 
                    [caseId]: result.data.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    )
                }))
        } else {
                throw new Error(result.error || 'Failed to load alerts')
            }
        } catch (error) {
            console.error(`Error loading alerts for case ${caseId}:`, error)
            setAlertsError(prev => ({ 
                ...prev, 
                [caseId]: error.message || 'Error loading alerts' 
            }))
            if (error.message === 'Authentication required') {
                setShowAuthModal(true)
            }
        }

        setAlertsLoading(prev => ({ ...prev, [caseId]: false }))
    }

    // Function to toggle case expansion and load alerts
    const toggleCase = (caseId) => {
        if (expandedCase === caseId) {
            setExpandedCase(null)
            } else {
            setExpandedCase(caseId)
            if (!alerts[caseId]) {
                loadAlerts(caseId)
            }
        }
    }

    // Render alerts for a case
    const renderAlerts = (caseId) => {
        if (alertsLoading[caseId]) {
            return <div className="text-gray-400 mt-4">Loading alerts...</div>
        }

        if (alertsError[caseId]) {
            return <div className="text-red-500 mt-4">Error: {alertsError[caseId]}</div>
        }

        const caseAlerts = alerts[caseId] || []
        if (caseAlerts.length === 0) {
            return <div className="text-gray-400 mt-4">No alerts found</div>
        }

        return (
            <div className="mt-4 space-y-3">
                <h3 className="text-lg font-semibold text-cyan-400">Alerts ({caseAlerts.length})</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700 bg-gray-900">
                        <thead>
                            <tr className="bg-gray-800">
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenant</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kill Chain Stage</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Alert Name</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Technique</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Host</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source IP</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source Type</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source Geo</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Destination IP</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Destination Type</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Destination Geo</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-gray-800">
                            {caseAlerts.map((alert, index) => (
                                <tr key={alert._id || index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/50'}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(alert.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {alert.tenant_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {alert.xdr_killchain_stage || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-cyan-300">
                                        {alert.xdr_event?.display_name || alert.display_name || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {alert.xdr_event?.technique?.name || '-'}
                                            {alert.xdr_event?.technique?.id && (
                                                <span className="ml-1 text-gray-400">({alert.xdr_event.technique.id})</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            {alert.event_category || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            alert.status?.toLowerCase().includes('new') ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                            alert.status?.toLowerCase().includes('in progress') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                            alert.status?.toLowerCase().includes('closed') ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                            'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        }`}>
                                            {alert.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {alert.hostname || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="font-mono text-cyan-300">{alert.source_ip || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {alert.source_type || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            {alert.source_geo?.country_code || '-'}
                                            {alert.source_geo?.city && (
                                                <span className="ml-1 text-gray-400">({alert.source_geo.city})</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="font-mono text-cyan-300">{alert.destination_ip || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                        {alert.destination_type || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            {alert.destination_geo?.country_code || '-'}
                                            {alert.destination_geo?.city && (
                                                <span className="ml-1 text-gray-400">({alert.destination_geo.city})</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        <div className="max-w-xs truncate" title={alert.xdr_event?.description || alert.description}>
                                            {alert.xdr_event?.description || alert.description || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderCases = (cases) => {
        if (casesLoading) {
            return <div className="text-gray-400">Loading cases...</div>
        }

        if (casesError) {
            return <div className="text-red-500">Error loading cases: {casesError}</div>
        }

        // Ensure cases is an array before mapping
        const casesArray = Array.isArray(cases) ? cases : [];
        
        if (casesArray.length === 0) {
            return <div className="text-gray-400">No cases found</div>
        }

        return (
            <div className="grid grid-cols-1 gap-4">
                {casesArray.map((caseItem, index) => (
                    <div key={caseItem._id || index} className="bg-gray-800 rounded-lg p-4 shadow">
                        {/* Header Section */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between">
                                <div 
                                    className="text-cyan-400 text-lg font-semibold cursor-pointer hover:text-cyan-300"
                                    onClick={() => toggleCase(caseItem._id)}
                                >
                                    #{caseItem.ticket_id || index + 1} - {caseItem.name || 'Unnamed Case'}
                                </div>
                                <div className="flex gap-2">
                                    {caseItem.status && (
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            caseItem.status === 'New' ? 'bg-green-600' : 
                                            caseItem.status === 'In Progress' ? 'bg-blue-600' : 
                                            caseItem.status === 'Closed' ? 'bg-gray-600' : 'bg-gray-600'
                                        }`}>
                                            {caseItem.status}
                                        </span>
                                    )}
                                    {caseItem.severity && (
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            caseItem.severity === 'Critical' ? 'bg-red-600' : 
                                            caseItem.severity === 'High' ? 'bg-orange-600' : 
                                            caseItem.severity === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'
                                        }`}>
                                            {caseItem.severity}
                                        </span>
                                    )}
                                    {typeof caseItem.score !== 'undefined' && (
                                        <span className="px-2 py-1 rounded text-sm bg-purple-600">
                                            Score: {Number(caseItem.score).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tactics */}
                            {caseItem.summary?.tactics?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {caseItem.summary.tactics.map((tactic, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-gray-700 rounded-full text-gray-300">
                                            {tactic}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Hosts Section */}
                            <div className="bg-gray-900 p-3 rounded">
                                <div className="text-gray-400 text-sm mb-2">Affected Hosts</div>
                                <div className="space-y-1">
                                    {caseItem.summary?.observables?.host?.values?.map((host, idx) => (
                                        <div key={idx} className="text-white text-sm">
                                            {host.hostname || host.value}
                                            {host.ip && host.ip !== (host.hostname || host.value) && (
                                                <span className="text-gray-400 ml-2">({host.ip})</span>
                                            )}
                                        </div>
                                    )) || <div className="text-gray-500">No hosts affected</div>}
                                </div>
                            </div>

                            {/* Users Section */}
                            <div className="bg-gray-900 p-3 rounded">
                                <div className="text-gray-400 text-sm mb-2">Involved Users</div>
                                <div className="space-y-1">
                                    {caseItem.summary?.observables?.user?.values?.map((user, idx) => (
                                        <div key={idx} className="text-white text-sm">
                                            {user.username || user.value}
                                        </div>
                                    )) || <div className="text-gray-500">No users involved</div>}
                                </div>
                            </div>
                        </div>

                        {/* Techniques */}
                        {caseItem.summary?.techniques?.length > 0 && (
                            <div className="bg-gray-900 p-3 rounded mb-4">
                                <div className="text-gray-400 text-sm mb-2">Techniques</div>
                                <div className="flex flex-wrap gap-2">
                                    {caseItem.summary.techniques.map((technique, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-300">
                                            {technique}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-sm text-gray-400 flex justify-between items-center mt-4">
                            <div>
                                Created: {new Date(caseItem.created_at).toLocaleString()}
                            </div>
                            <div>
                                {caseItem.size ? `Size: ${caseItem.size} alerts` : ''}
                            </div>
                            <div>
                                {caseItem.tenant_name || caseItem.cust_id || ''}
                            </div>
                        </div>

                        {/* Show alerts when case is expanded */}
                        {expandedCase === caseItem._id && (
                            <div className="border-t border-gray-700 pt-4">
                                {renderAlerts(caseItem._id)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
            <Toaster position="top-right" />
            
            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-200">Authentication Required</h2>
                        {casesError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                                {casesError}
                            </div>
                        )}
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={authCredentials.username}
                                    onChange={(e) => setAuthCredentials(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-gray-200"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={authCredentials.password}
                                        onChange={(e) => setAuthCredentials(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-gray-200 pr-10"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono">
                            Monitoring Dashboard
                        </h1>
                    <p className="text-gray-400 mt-3 text-lg font-mono">
                        Cases for {format(selectedDate, 'MMMM d, yyyy')}: {filteredCases.length}
                    </p>
                            </div>

                {/* Filters Bar */}
                <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg mb-8 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center gap-6">
                        {/* Date and Refresh Group */}
                        <div className="flex items-center gap-3">
                            <DatePicker
                                selected={selectedDate}
                                onChange={handleDateChange}
                                dateFormat="MMMM d, yyyy"
                                maxDate={new Date()}
                                className="px-4 py-2.5 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 
                                         focus:outline-none focus:border-cyan-500 w-56 text-base"
                                placeholderText="Select date..."
                                popperClassName="react-datepicker-popper"
                                popperPlacement="bottom-start"
                                showPopperArrow={false}
                            />
                            
                            <button
                                onClick={() => loadCases(selectedDate)}
                                disabled={casesLoading}
                                className="px-4 py-2.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 
                                         border border-cyan-500/30 flex items-center gap-2 disabled:opacity-50 
                                         disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center"
                            >
                                <svg 
                                    className={`w-5 h-5 ${casesLoading ? 'animate-spin' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                    />
                                </svg>
                                {casesLoading ? 'Refreshing...' : 'Refresh'}
                                                </button>
                                            </div>

                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[300px]">
                                                        <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search cases by name, ID, severity, techniques..."
                                className="w-full px-4 py-2.5 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 
                                         placeholder-gray-500 focus:outline-none focus:border-cyan-500 pr-10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 
                                             p-1 rounded-full hover:bg-gray-700/50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                </div>

                        {/* Tenant Filter */}
                    <select
                            value={selectedTenant}
                            onChange={(e) => setSelectedTenant(e.target.value)}
                            className="px-4 py-2.5 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 
                                     focus:outline-none focus:border-cyan-500 min-w-[160px]"
                        >
                            {tenants.map(tenant => (
                                <option key={tenant} value={tenant}>
                                    {tenant === 'all' ? 'All Tenants' : tenant}
                                </option>
                            ))}
                    </select>
                    </div>
                </div>

                {/* Cases Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-200 mb-6 font-mono">Cases</h2>
                    {renderCases(filteredCases)}
                </div>
            </div>
        </div>
    )
}