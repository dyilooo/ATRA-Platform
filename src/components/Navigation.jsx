"use client"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { auth } from '@/services/firebase'
import { logOut } from '@/services/auth'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [monitoringExpanded, setMonitoringExpanded] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [dropdownTop, setDropdownTop] = useState(0)
  const monitoringButtonRef = useRef(null)

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (monitoringButtonRef.current && isCollapsed) {
        const rect = monitoringButtonRef.current.getBoundingClientRect()
        setDropdownTop(rect.top + window.scrollY)
      }
    }

    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition)
    window.addEventListener('resize', updateDropdownPosition)

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [isCollapsed, monitoringExpanded])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Auto-expand monitoring section if on a monitoring page
    if (pathname.startsWith('/monitoring')) {
      setMonitoringExpanded(true)
    }

    return () => unsubscribe()
  }, [pathname])

  // Don't render sidebar if loading or no user
  if (loading || !user) return null

  const handleLogout = async () => {
    try {
      const { success, error } = await logOut()
      if (success) {
        localStorage.removeItem('vtApiKey')
        setUser(null)
        router.push('/auth/signin')
        toast.success('Logged out successfully')
      } else {
        toast.error(error || 'Failed to log out')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
    }
  }

  const SidebarLink = ({ href, icon, children, isActive }) => (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 mb-2 rounded-md font-mono transition-all duration-300 text-sm ${
        isActive
          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          : 'text-gray-400 hover:bg-gray-800 hover:text-yellow-300'
      }`}
    >
      {icon}
      {!isCollapsed && children}
    </Link>
  )

  const navItems = [
    { 
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      )
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: (
        <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ]

  const settingsItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Trash',
      href: '/trash',
      icon: (
        <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
  ]

  const helpItems = [
    {
      name: 'Help',
      href: '/help',
      icon: (
        <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ]

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className={`flex flex-col h-screen bg-gray-900 border-r border-yellow-500/20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <Toaster position="top-right" />
        
        {/* Logo/Brand Area */}
        <div className="flex items-center justify-between p-3 border-b border-yellow-500/20 bg-gradient-to-r from-gray-900 to-gray-800">
          {isCollapsed ? (
            <Image
              src="/images/atra-logo-small.png"
              alt="ATRA Icon"
              width={40}
              height={40}
              className="object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_3px_rgba(234,179,8,0.3)]"
              priority
            />
          ) : (
            <Image
              src="/images/atra-logo.png"
              alt="ATRA & Associates CISO"
              width={200}
              height={35}
              className="object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_3px_rgba(234,179,8,0.3)]"
              priority
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-yellow-300 transition-colors duration-300"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? "M11 19l-3-3m0 0l3-3m-3 3h14m-14 0l-3-3m3 3l-3 3" : "M13 5l3 3m0 0l-3 3m3-3H2m14 0l3-3m-3 3l3 3"}
              />
            </svg>
          </button>
        </div>
        
        {/* Navigation Links */}
        <div 
          className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Main Navigation Items */}
          {navItems.map((item) => (
            <SidebarLink 
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </SidebarLink>
          ))}
          
          {/* ATRA Monitoring Dropdown */}
          <div className="mb-2 relative group">
            <button
              ref={monitoringButtonRef}
              onClick={() => setMonitoringExpanded(!monitoringExpanded)}
              className={`flex items-center w-full px-4 py-3 rounded-md font-mono transition-all duration-300 text-sm ${
                pathname.startsWith('/monitoring') || monitoringExpanded
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-yellow-300'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <svg 
                className={`w-5 h-5 min-w-[1.25rem] ${isCollapsed ? '' : 'mr-3'}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              {!isCollapsed && (
                <>
                  <span className="flex-1">ATRA Monitoring</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-300 ${monitoringExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
              {isCollapsed && (
                <svg
                  className={`h-4 w-4 ml-1 transition-transform duration-300 ${monitoringExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l3 3m0 0l-3 3m3-3H8m13 0l3-3m-3 3l3 3"
                  />
                </svg>
              )}
            </button>
            
            {monitoringExpanded && (
              <div 
                className={`${
                  isCollapsed 
                    ? 'fixed left-[5rem] bg-gray-800 rounded-lg border border-yellow-500/20 shadow-lg w-64 py-2 z-50' 
                    : 'pl-4'
                }`}
                style={{
                  boxShadow: isCollapsed ? '0 4px 6px -1px rgba(234, 179, 8, 0.1), 0 2px 4px -1px rgba(234, 179, 8, 0.06)' : 'none',
                  top: isCollapsed ? `${dropdownTop}px` : 'auto'
                }}
              >
                {isCollapsed ? (
                  // Collapsed state menu items with icons
                  <>
                    <div className="flex items-center px-4 py-2 mb-1 text-yellow-300 border-b border-yellow-500/20">
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="font-mono text-sm">ATRA Monitoring</span>
                    </div>
                    <Link
                      href="/monitoring"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      SOC Monitoring
                    </Link>
                    <Link
                      href="/monitoring/blocked-ips"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/blocked-ips'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                      </svg>
                      Blocked IP's and DNS
                    </Link>
                    <Link
                      href="/monitoring/atip-consolidated"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/atip-consolidated'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                        />
                      </svg>
                      ATIP Consolidated
                    </Link>
                    <Link
                      href="/monitoring/reports"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/reports'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      Reports
                    </Link>
                  </>
                ) : (
                  // Expanded state menu items
                  <>
                    <Link
                      href="/monitoring"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      SOC Monitoring
                    </Link>
                    <Link
                      href="/monitoring/blocked-ips"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/blocked-ips'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                      </svg>
                      Blocked IP's and DNS
                    </Link>
                    <Link
                      href="/monitoring/atip-consolidated"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/atip-consolidated'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                        />
                      </svg>
                      ATIP Consolidated
                    </Link>
                    <Link
                      href="/monitoring/reports"
                      className={`flex items-center px-4 py-2.5 rounded-md font-mono text-sm transition-all duration-300 ${
                        pathname === '/monitoring/reports'
                          ? 'text-yellow-300 bg-yellow-500/10'
                          : 'text-gray-400 hover:bg-gray-700/80 hover:text-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      Reports
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Database and other items */}
          <SidebarLink 
            href="/database"
            icon={
              <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            }
            isActive={pathname === '/database'}
          >
            Database
          </SidebarLink>

          {/* Team */}
          <SidebarLink 
            href="/team"
            icon={
              <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            isActive={pathname === '/team'}
          >
            Team
          </SidebarLink>

          {/* Attendance */}
          <SidebarLink 
            href="/attendance"
            icon={
              <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            isActive={pathname === '/attendance'}
          >
            Attendance
          </SidebarLink>

          {/* Notifications */}
          <SidebarLink 
            href="/notifications"
            icon={
              <svg className="w-5 h-5 min-w-[1.25rem] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
            isActive={pathname === '/notifications'}
          >
            Notifications
          </SidebarLink>

          {/* VirusTotal Checker */}
          <SidebarLink 
            href="/checker"
            icon={
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            isActive={pathname === '/checker'}
          >
            VirusTotal Checker
          </SidebarLink>

          {/* Settings Section Separator */}
          <div className={`my-4 border-t border-yellow-500/20 ${isCollapsed ? 'mx-2' : 'mx-0'}`}></div>

          {/* Settings Items */}
          {settingsItems.map((item) => (
            <SidebarLink 
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </SidebarLink>
          ))}

          {/* Help Section Separator */}
          <div className={`my-4 border-t border-yellow-500/20 ${isCollapsed ? 'mx-2' : 'mx-0'}`}></div>

          {/* Help Items */}
          {helpItems.map((item) => (
            <SidebarLink 
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </SidebarLink>
          ))}
        </div>
        
        {/* User Info & Logout */}
        <div className={`p-4 border-t border-yellow-500/20 ${isCollapsed ? 'items-center' : ''}`}>
          {user && (
            <div className="flex flex-col space-y-3">
              {!isCollapsed && (
                <span className="text-gray-400 font-mono text-xs truncate">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className={`px-4 py-2 bg-red-500/20 text-red-300 rounded-md 
                         hover:bg-red-500/30 transition-all duration-300 font-mono
                         border border-red-500/30 text-sm flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                {!isCollapsed && "Logout"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

