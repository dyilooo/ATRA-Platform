"use client"

import { useState } from "react"
import Image from "next/image"
import { Users } from "lucide-react"

export default function OrganizationalChart() {
  const [activeTab, setActiveTab] = useState("atr")

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-500/20 p-3 rounded-full border border-yellow-500/30">
          <Users className="h-6 w-6 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">ATRAC</span>
          <span className="text-red-600">aaS</span> Organizational Chart
        </h1>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("atr")}
          className={`px-6 py-2 rounded-md transition-all duration-300 font-mono text-sm
            ${activeTab === "atr" 
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
              : "bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:bg-gray-800"}`}
        >
          ATR & Associates
        </button>
        <button
          onClick={() => setActiveTab("tenant")}
          className={`px-6 py-2 rounded-md transition-all duration-300 font-mono text-sm
            ${activeTab === "tenant" 
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
              : "bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:bg-gray-800"}`}
        >
          Tenant View
        </button>
      </div>

      {activeTab === "atr" && (
        <div className="mb-10">
          <h2 className="text-center text-xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            ATR & ASSOCIATES
          </h2>
          <h3 className="text-center text-lg mb-12 text-gray-400">Organizational Chart</h3>

          <div className="flex flex-col items-center">
            {/* CEO Level */}
            <div className="mb-12 relative">
              <div className="border-2 border-yellow-500/30 rounded-lg p-4 w-72 
                           bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-yellow-500/10
                           transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 border-2 border-yellow-500/30
                               group-hover:border-yellow-500/50 transition-all duration-300">
                    <Image
                      src="/images/atr.jpg?height=80&width=80"
                      alt="Angel T. Redoble"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-yellow-400">ANGEL T. REDOBLE</p>
                    <p className="text-sm text-gray-400">CEO/Managing Partner</p>
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 bottom-0 w-0.5 h-12 bg-gradient-to-b from-yellow-500/50 to-transparent transform translate-y-full -translate-x-1/2"></div>
            </div>

            {/* COO Level */}
            <div className="mb-12 relative">
              <div className="border-2 border-yellow-500/30 rounded-lg p-4 w-72 
                           bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-yellow-500/10
                           transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 border-2 border-yellow-500/30
                               group-hover:border-yellow-500/50 transition-all duration-300">
                    <Image
                      src="/images/ellen.jpg?height=80&width=80"
                      alt="Ellen L. Solongo"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-yellow-400">ELLEN L. SOLOSOD</p>
                    <p className="text-sm text-gray-400">COO/Senior Partner</p>
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 bottom-0 w-0.5 h-12 bg-gradient-to-b from-yellow-500/50 to-transparent transform translate-y-full -translate-x-1/2"></div>
            </div>

            {/* Team Leaders */}
            <div className="mb-12 relative">
              <div className="bg-yellow-500/20 rounded-lg py-3 px-8 font-bold text-yellow-400 border border-yellow-500/30
                           shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
                TEAM LEADERS
              </div>
              <div className="absolute left-1/2 bottom-0 w-0.5 h-12 bg-gradient-to-b from-yellow-500/50 to-transparent transform translate-y-full -translate-x-1/2"></div>
              <div className="absolute left-1/2 bottom-0 w-[800px] h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent transform translate-y-[48px] -translate-x-1/2"></div>
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-5 gap-8 w-full max-w-6xl">
              {[
                { 
                  name: "ENGR. JUSTINE KYLE D. ALITAO,CPE",
                  image: "/images/justin.jpg",
                  role: "Team Leader"
                },
                { 
                  name: "ENGR. CALVIN REY E. EDIANEL,CPE",
                  image: "/images/calvin.jpeg",
                  role: "Team Leader"
                },
                { 
                  name: "ENGR. ESTEBAN L. LACHICA,CPE",
                  image: "/images/esteban.jpg",
                  role: "Team Leader"
                },
                { 
                  name: "ENGR. ALLINA MARIE F. MORALES,CPE",
                  image: "/images/allina.jpg",
                  role: "Team Leader"
                },
                { 
                  name: "ENGR. KIRSHE T. TIONGCO,CPE",
                  image: "/images/kirshe.jpg",
                  role: "Team Leader"
                }
              ].map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-12 w-0.5 bg-gradient-to-b from-yellow-500/50 to-transparent mb-4"></div>
                  <div className="border-2 border-yellow-500/30 rounded-lg p-4 
                               bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-yellow-500/10
                               transition-all duration-300 group w-full">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border-2 border-yellow-500/30
                                   group-hover:border-yellow-500/50 transition-all duration-300 mb-3">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={64}
                          height={64}
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                      </div>
                      <p className="font-bold text-sm text-yellow-400 text-center">{member.name}</p>
                      <p className="text-xs text-gray-400 text-center mt-1">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tenant" && (
        <div className="mb-10">
          <h2 className="text-center text-xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Tenant Organization
          </h2>
          <h3 className="text-center text-lg mb-12 text-gray-400">Team Structure</h3>

          <div className="flex">
            {/* Left side labels */}
            <div className="w-48 flex flex-col gap-6 pr-8 mt-8">
              {[
                { label: "EAS", active: true },
                { label: "SOC", active: true },
                { label: "ATIP", active: false },
                { label: "VA", active: false },
                { label: "GRC", active: true }
              ].map((item, index) => (
                <div key={index} 
                     className={`py-2 px-6 text-center rounded-full transition-all duration-300
                               ${item.active 
                                 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:shadow-yellow-500/10" 
                                 : "text-gray-400"}`}>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Right side content */}
            <div className="flex-1">
              <div className="flex flex-col items-center">
                {/* Management Level */}
                <div className="flex justify-center gap-8 mb-16">
                  {/* SDM Card */}
                  <div className="border-2 border-yellow-500/30 rounded-2xl p-4 w-72
                               bg-gray-800/50 backdrop-blur-sm shadow-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-yellow-500/30 mb-3">
                        <Image
                          src="/images/justin.jpg"
                          alt="ENGR. JUSTINE KYLE D. ALITAO"
                          width={96}
                          height={96}
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </div>
                      <p className="font-bold text-sm text-yellow-400 text-center">ENGR. JUSTINE KYLE D. ALITAO,CPE</p>
                      <p className="text-xs text-gray-400 text-center mt-1">Service Delivery Manager(SDM)</p>
                    </div>
                  </div>

                  {/* GRC Specialist Card */}
                  <div className="border-2 border-yellow-500/30 rounded-2xl p-4 w-72
                               bg-gray-800/50 backdrop-blur-sm shadow-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-yellow-500/30 mb-3">
                        <Image
                          src="/images/calvin.jpeg"
                          alt="ENGR. CALVIN REY E. EDIANEL"
                          width={96}
                          height={96}
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg?height=96&width=96"
                          }}
                        />
                      </div>
                      <p className="font-bold text-sm text-yellow-400 text-center">ENGR. CALVIN REY E. EDIANEL,CPE</p>
                      <p className="text-xs text-gray-400 text-center mt-1">GRC Specialist</p>
                    </div>
                  </div>
                </div>

                {/* Connecting Lines */}
                <div className="relative w-full h-12 mb-8">
                  <div className="absolute left-1/2 w-[400px] h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent transform -translate-x-1/2"></div>
                  <div className="absolute left-1/2 w-0.5 h-12 bg-gradient-to-b from-yellow-500/50 to-transparent transform -translate-x-1/2"></div>
                </div>

                {/* Incident Responders Header */}
                <div className="bg-yellow-300 rounded-lg py-3 px-12 font-bold text-gray-900 mb-12">
                  INCIDENT RESPONDERS
                </div>

                {/* Incident Responders Grid */}
                <div className="grid grid-cols-2 gap-16 w-full max-w-2xl">
                  {/* IR 1 */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-0.5 bg-gradient-to-b from-yellow-500/50 to-transparent mb-4"></div>
                    <div className="border-2 border-yellow-500/30 rounded-2xl p-6
                                 bg-gray-800/50 backdrop-blur-sm shadow-lg w-48 h-48
                                 flex items-center justify-center">
                      <p className="font-bold text-yellow-400 text-xl">IR 1</p>
                    </div>
                  </div>

                  {/* IR 2 */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-0.5 bg-gradient-to-b from-yellow-500/50 to-transparent mb-4"></div>
                    <div className="border-2 border-yellow-500/30 rounded-2xl p-6
                                 bg-gray-800/50 backdrop-blur-sm shadow-lg w-48 h-48
                                 flex items-center justify-center">
                      <p className="font-bold text-yellow-400 text-xl">IR 2</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
