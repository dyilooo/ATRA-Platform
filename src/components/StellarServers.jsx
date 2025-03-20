"use client"
import { useState, useEffect } from 'react';
import { fetchStellarData } from '@/services/stellar';
import { getAuthToken } from '@/services/auth';
import toast from 'react-hot-toast';

export default function StellarServers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authCredentials, setAuthCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { success, token, error } = await getAuthToken(
      authCredentials.username, 
      authCredentials.password
    );

    if (success && token) {
      setShowAuthModal(false);
      localStorage.setItem('stellar_token', token);
      loadStellarData();
    } else {
      setError(error || 'Authentication failed');
      toast.error(`Authentication failed: ${error || 'Invalid credentials'}`);
    }
    setLoading(false);
  };

  const loadStellarData = async () => {
    setLoading(true);
    setError(null);
    const { success, data, error } = await fetchStellarData();
    
    if (success) {
      console.log('Received server data:', data);
      setServers(Array.isArray(data) ? data : []);
      setShowAuthModal(false);
    } else {
      console.error('Error loading data:', error);
      if (error === 'Authentication required' || error.includes('Authentication failed')) {
        setShowAuthModal(true);
        localStorage.removeItem('stellar_token');
        if (error !== 'Authentication required') {
          setError(error);
          toast.error(`Failed to load server data: ${error}`);
        }
      } else {
        setError(error);
        toast.error(`Failed to load server data: ${error}`);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('stellar_token');
    if (!token) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    loadStellarData();
  }, []);

  const handleRefresh = () => {
    loadStellarData();
    toast.success('Refreshing server data...');
  };

  if (loading && !showAuthModal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Authentication Required</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                {error}
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

      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-md 
                   hover:bg-cyan-500/30 transition-all duration-300 font-mono
                   border border-cyan-500/30 text-sm flex items-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && !showAuthModal ? (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
          <h3 className="text-lg font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg border border-cyan-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/70">
                  <th className="p-3 text-left font-mono text-gray-400">Server Name</th>
                  <th className="p-3 text-left font-mono text-gray-400">Status</th>
                  <th className="p-3 text-left font-mono text-gray-400">IP Address</th>
                  <th className="p-3 text-left font-mono text-gray-400">Last Seen</th>
                  <th className="p-3 text-left font-mono text-gray-400">Version</th>
                </tr>
              </thead>
              <tbody>
                {servers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center font-mono text-gray-400">
                      No servers found
                    </td>
                  </tr>
                ) : (
                  servers.map((server, index) => (
                    <tr key={index} className="border-t border-gray-700/50">
                      <td className="p-3 font-mono text-gray-300">{server.name || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-mono ${
                          server.status === 'online' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {server.status || 'unknown'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-300">{server.ip || 'N/A'}</td>
                      <td className="p-3 font-mono text-gray-300">
                        {server.lastSeen ? new Date(server.lastSeen).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 font-mono text-gray-300">{server.version || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 