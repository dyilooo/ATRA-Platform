"use client"
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Shield, ShieldOff, Search, Plus, AlertTriangle, CheckCircle, Trash2, RefreshCw, Globe, Cpu } from 'lucide-react';

export default function BlockedIPAndDNS() {
  // Enhanced initial state with more realistic data
  const [entries, setEntries] = useState([
    { id: 1, type: 'IP', value: '192.168.1.1', blocked: true, threats: ['Reconnaissance'], lastDetected: '2025-03-15T14:23:00' },
    { id: 2, type: 'IP', value: '45.33.49.121', blocked: true, threats: ['Brute Force'], lastDetected: '2025-03-16T09:12:00' },
    { id: 3, type: 'Domain', value: 'malware-payload.com', blocked: true, threats: ['Malware Distribution'], lastDetected: '2025-03-14T22:05:00' },
    { id: 4, type: 'Domain', value: 'phishing-attempt.net', blocked: true, threats: ['Phishing'], lastDetected: '2025-03-15T18:43:00' },
    { id: 5, type: 'IP', value: '10.0.0.15', blocked: false, threats: ['Suspicious Activity'], lastDetected: '2025-03-16T11:30:00' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({ type: 'IP', value: '', blocked: false, threats: ['Suspicious Activity'], tenant: 'Tenant1' });
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTenant, setFilterTenant] = useState('ALL');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'lastDetected', direction: 'desc' });
  const [statsData, setStatsData] = useState({
    blockedIPs: 0,
    blockedDomains: 0,
    unblockedIPs: 0,
    unblockedDomains: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Threat categories for dropdown
  const threatCategories = [
    'Suspicious Activity',
    'Brute Force',
    'Malware Distribution',
    'Command & Control',
    'Reconnaissance',
    'Data Exfiltration',
    'Phishing',
    'Cryptomining',
    'DDoS'
  ];

  // Update statistics when entries change
  useEffect(() => {
    const blockedIPs = entries.filter(e => e.type === 'IP' && e.blocked).length;
    const blockedDomains = entries.filter(e => e.type === 'Domain' && e.blocked).length;
    const unblockedIPs = entries.filter(e => e.type === 'IP' && !e.blocked).length;
    const unblockedDomains = entries.filter(e => e.type === 'Domain' && !e.blocked).length;
    
    setStatsData({
      blockedIPs,
      blockedDomains,
      unblockedIPs,
      unblockedDomains
    });
  }, [entries]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add new entry
  const handleAddEntry = () => {
    if (!newEntry.value) {
      toast.error('Please enter a value');
      return;
    }
    
    // Validate IP address format if type is IP
    if (newEntry.type === 'IP') {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(newEntry.value)) {
        toast.error('Invalid IP address format');
        return;
      }
    }
    
    // Validate domain format if type is Domain
    if (newEntry.type === 'Domain') {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(newEntry.value)) {
        toast.error('Invalid domain format');
        return;
      }
    }
    
    const newId = Math.max(...entries.map(e => e.id), 0) + 1;
    const now = new Date().toISOString();
    
    setEntries([...entries, { 
      ...newEntry, 
      id: newId, 
      lastDetected: now 
    }]);
    
    setNewEntry({ type: 'IP', value: '', blocked: false, threats: ['Suspicious Activity'], tenant: 'Tenant1' });
    setIsAddingEntry(false);
    toast.success(`${newEntry.type} added to list`);
  };

  // Update entry
  const handleUpdateEntry = (id, updatedFields) => {
    const updatedEntries = entries.map(entry => 
      entry.id === id ? { ...entry, ...updatedFields } : entry
    );
    setEntries(updatedEntries);
    toast.success(`Entry updated`);
  };

  // Delete entry
  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    toast.success('Entry removed');
  };

  // Toggle entry blocked status with visual feedback
  const toggleBlockStatus = (id) => {
    const entry = entries.find(e => e.id === id);
    const newStatus = !entry.blocked;
    
    handleUpdateEntry(id, { blocked: newStatus });
    
    if (newStatus) {
      toast.success(`${entry.type} ${entry.value} has been blocked`);
    } else {
      toast('Block removed', { icon: '🔓' });
    }
  };

  // Handle sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Simulate refresh data from server
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Data refreshed');
    }, 800);
  };

  // Apply sorting and filtering
  const getSortedAndFilteredEntries = () => {
    let filteredList = entries.filter((entry) => {
      const matchesType = filterType === 'ALL' || entry.type === filterType;
      const matchesStatus = filterStatus === 'ALL' || 
        (filterStatus === 'BLOCKED' && entry.blocked) ||
        (filterStatus === 'ALLOWED' && !entry.blocked);
      const matchesTenant = filterTenant === 'ALL' || entry.tenant === filterTenant;
      const matchesSearch = !searchTerm || 
        entry.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.threats.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return matchesType && matchesStatus && matchesTenant && matchesSearch;
    });
    
    if (sortConfig.key) {
      filteredList.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredList;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const filteredEntries = getSortedAndFilteredEntries();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-cyan-950/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono mb-3 md:mb-0">
            Network Threat Blocker
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={refreshData} 
              className="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-800 rounded-md text-cyan-400 flex items-center gap-1.5 text-sm border border-gray-700 transition-all"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg flex flex-col">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Blocked IPs</div>
            <div className="text-2xl text-cyan-400 font-mono flex gap-2 items-center">
              <Shield size={20} />
              {statsData.blockedIPs}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg flex flex-col">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Blocked Domains</div>
            <div className="text-2xl text-cyan-400 font-mono flex gap-2 items-center">
              <Globe size={20} />
              {statsData.blockedDomains}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg flex flex-col">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Unblocked IPs</div>
            <div className="text-2xl text-cyan-400 font-mono flex gap-2 items-center">
              <ShieldOff size={20} />
              {statsData.unblockedIPs}
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg flex flex-col">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Unblocked Domains</div>
            <div className="text-2xl text-cyan-400 font-mono flex gap-2 items-center">
              <Globe size={20} />
              {statsData.unblockedDomains}
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search IP, domain or threat type..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-md text-gray-300 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-md text-gray-300 font-mono focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          >
            <option value="ALL">All Types</option>
            <option value="IP">IP Address</option>
            <option value="Domain">Domain</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-md text-gray-300 font-mono focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="BLOCKED">Blocked</option>
            <option value="ALLOWED">Allowed</option>
          </select>

          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/30 border border-gray-700/50 rounded-md text-gray-300 font-mono focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          >
            <option value="ALL">All Tenants</option>
            <option value="Tenant1">NIKI</option>
            <option value="Tenant2">MWELL</option>
            <option value="Tenant3">MPIW</option>
            <option value="Tenant4">SiyCHA</option>
            {/* Add more tenants as needed */}
          </select>
          
          <button
            onClick={() => setIsAddingEntry(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-md font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
        
        {/* Add New Entry Form */}
        {isAddingEntry && (
          <div className="mb-6 p-6 bg-gray-800/60 border border-gray-700/80 rounded-lg animate-fadeIn shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Add New IP or DNS Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Type</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-md text-gray-300 focus:outline-none"
                >
                  <option value="IP">IP Address</option>
                  <option value="Domain">Domain</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Value</label>
                <input
                  type="text"
                  placeholder="Enter IP or Domain"
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-md text-gray-300 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Threat Category</label>
                <select
                  value={newEntry.threats[0]}
                  onChange={(e) => setNewEntry({ ...newEntry, threats: [e.target.value] })}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-md text-gray-300 focus:outline-none"
                >
                  {threatCategories.map((threat, index) => (
                    <option key={index} value={threat}>{threat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Tenant</label>
                <select
                  value={newEntry.tenant}
                  onChange={(e) => setNewEntry({ ...newEntry, tenant: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-md text-gray-300 focus:outline-none"
                >
                  <option value="Tenant1">NIKI</option>
                  <option value="Tenant2">MWELL</option>
                  <option value="Tenant3">MPIW</option>
                  <option value="Tenant4">SiyCHA</option>
                  {/* Add more tenants as needed */}
                </select>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={handleAddEntry}
                className="px-5 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white rounded-md font-medium transition-all"
              >
                Add Entry
              </button>
            </div>
          </div>
        )}
        
        {/* Entries List */}
        <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-4">
          <h2 className="text-lg font-medium mb-3 text-cyan-400">Blocked Entries</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Value</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{entry.type}</td>
                  <td className="px-4 py-2">{entry.value}</td>
                  <td className="px-4 py-2">
                    {entry.blocked ? (
                      <span className="text-green-500">Blocked</span>
                    ) : (
                      <span className="text-red-500">Allowed</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {!entry.blocked && (
                      <button
                        onClick={() => toggleBlockStatus(entry.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white rounded-md font-medium transition-all flex items-center gap-1.5"
                      >
                        <Shield size={16} />
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}