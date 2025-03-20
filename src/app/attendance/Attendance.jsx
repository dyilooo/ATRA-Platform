'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Attendance() {
  const [selectedShift, setSelectedShift] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDay, setSelectedDay] = useState('monday')

  // Updated schedule data with day-specific schedules
  const scheduleData = {
    monday: {
      morning: {
        analysts: [
          'Alcontin, Joshua M.',
          'Diaz, Relyn Ann L.',
          'Dusaran, John Paul E.',
          'Angcos, Mark Joseph E.',
          'Manrique, Jeanne Leigh F.',
          'Diano, Hitler B.',
          'Esteban John Mark',
          'Jories Anton V. Condat'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      },
      afternoon: {
        analysts: [
          'Daquila, Eric John M.',
          'Marmolejo, Noel Pio N.',
          'Miranda, Jaylord M.',
          'Balauro, Bernard P.',
          'Borce, Prince Ariel',
          'Cunanan, Kim Gerard',
          'Vetriolo, Daniel Jr.'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      },
      graveyard: {
        analysts: [
          'Daquila, Eric John M.',
          'Marmolejo, Noel Pio N.',
          'Miranda, Jaylord M.',
          'Balauro, Bernard P.',
          'Borce, Prince Ariel',
          'Cunanan, Kim Gerard',
          'Vetriolo, Daniel Jr.'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      }
    },
    tuesday: {
      morning: {
        analysts: [
          'Alcontin, Joshua M.',
          'Dusaran, John Paul E.',
          'Escamilla, Jan Denise J.',
          'Manrique, Jeanne Leigh F.',
          'Fernandez, Joanalyn Y.',
          'Jories Anton V. Condat'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      },
      afternoon: {
        analysts: [
          'Lape, Mary Rose O.',
          'Balauro, Bernard P.',
          'Miranda, Jaylord M.',
          'Suplico, Adrian D.',
          'Borce, Prince Ariel',
          'Cunanan, Kim Gerard'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      },
      graveyard: {
        analysts: [
          'Daquila, Eric John M.',
          'Marmolejo, Noel Pio N.',
          'Vetriolo, Daniel Jr.'
        ],
        teamLeaders: [
          'ENGR. Alitao, Justine Kyle D., CPE',
          'ENGR. Edianel, Calvin Rey E., CPE',
          'ENGR. Lachica, Esteban L., CPE',
          'ENGR. Morales, Allina Marie F., CPE',
          'ENGR. Tiongco, Kirshe T., CPE'
        ]
      }
    },
    wednesday: {
        morning: {
          analysts: [
            'Diaz, Relyn Ann L.',
            'Chua, Hillary Gabriel G.',
            'Cayao, Leomyr D.',
            'Angcos, Mark Joseph E.',
            'Martinez, Mart Angelo G.',
            'Uson, John Clifford B.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        afternoon: {
          analysts: [
            'Lape, Mary Rose O.',
            'Escamilla, Jan Denise J.',
            'Fernandez, Jonalyn Y.',
            'Diano, Hitler B.',
            'Esteban, John Mark'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        graveyard: {
          analysts: [
            'Balauro, Bernard P.',
            'Miranda, Jaylord M.',
            'Borce, Prince Arial',
            'Cunanan, Kim Gerard'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        }
    },
    thursday: {
        morning: {
          analysts: [
            'Daquila, Eric John M.',
            'Manrique, Jeanne Leigh F.',
            'Cayao, Leomyr D.',
            'Marmolejo, Noel Pio N.',
            'Martinez, Mart Angelo G.',
            'Uson, John Clifford B.',
            'Vetriolo, Daniel Jr.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        afternoon: {
          analysts: [
            'Alcontin, Joshua M.',
            'Diaz, Relyn Ann L.',
            'Dusaran, John Paul E.',
            'Angcos, Mark Joseph E.',
            'Suplico, Adrian D.',
            'Diano, Hitler B.',
            'Esteban, John Mark',
            'Jories Anton V. Condat'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        graveyard: {
          analysts: [
            'Lape, Mary Rose O.',
            'Escamilla, Jan Denise J.',
            'Chua, Hillary Gabriel G.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        }
    },
    friday: {
        morning: {
          analysts: [
            'Daquila, Eric John M.',
            'Balauro, Bernard P.',
            'Marmolejo, Noel Pio N.',
            'Miranda, Jaylord M.',
            'Borce, Prince Ariel',
            'Cunanan, Kim Gerard',
            'Vetriolo, Daniel Jr.',
            'Diano, Hitler B.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        afternoon: {
          analysts: [
            'Alcontin, Joshua M.',
            'Dusaran, John Paul E.',
            'Manrique, Jeanne Leigh F.',
            'Jories Anton V. Condat',
            'Fernandez, Joanalyn Y.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        graveyard: {
          analysts: [
            'Diaz, Relyn Ann L.',
            'Angcos, Mark Joseph E.',
            'Suplico, Adrian D.',
            'Esteban, John Mark'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        }
    },
    saturday: {
        morning: {
          analysts: [
            'Lape, Mary Rose O.',
            'Balauro, Bernard P.',
            'Escamilla, Jan Denise J.',
            'Miranda, Jaylord M.',
            'Borce, Prince Ariel',
            'Cunanan, Kim Gerard'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        afternoon: {
          analysts: [
            'Chua, Hillary Gabriel G.',
            'Fernandez, Joanalyn Y.',
            'Cayao, Leomyr D.',
            'Suplico, Adrian D.',
            'Martinez, Mart Angelo G.',
            'Uson, John Clifford B.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        graveyard: {
          analysts: [
            'Alcontin, Joshua M.',
            'Dusaran, John Paul E.',
            'Manrique, Jeanne Leigh F.',
            'Jories Anton V. Condat'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        }
    },
    sunday: {
        morning: {
          analysts: [
            'Diaz, Relyn Ann L.',
            'Angcos, Mark Joseph E.',
            'Diano, Hitler B.',
            'Esteban, John Mark'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        afternoon: {
          analysts: [
            'Chua, Hillary Gabriel G.',
            'Daquila, Eric John M.',
            'Cayao, Leomyr D.',
            'Marmolejo, Noel Pio N.',
            'Suplico, Adrian D.',
            'Martinez, Mart Angelo G.',
            'Uson, John Clifford B.',
            'Vetriolo, Daniel Jr.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        },
        graveyard: {
          analysts: [
            'Fernandez, Joanalyn Y.',
            'Lape, Mary Rose O.',
            'Escamilla, Jan Denise J.'
          ],
          teamLeaders: [
            'ENGR. Alitao, Justine Kyle D., CPE',
            'ENGR. Edianel, Calvin Rey E., CPE',
            'ENGR. Lachica, Esteban L., CPE',
            'ENGR. Morales, Allina Marie F., CPE',
            'ENGR. Tiongco, Kirshe T., CPE'
          ]
        }
    }
  }

  // Function to get current shift based on time
  const getCurrentShift = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 14) return 'morning'
    if (hour >= 14 && hour < 22) return 'afternoon'
    return 'graveyard'
  }

  // Get the date of Monday (start) of the current week
  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when Sunday
    return new Date(d.setDate(diff))
  }

  // Get date for a specific day in the current week
  const getDateFromDay = (dayName) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDate = new Date(selectedDate)
    const startOfWeek = getStartOfWeek(currentDate)
    const dayIndex = days.indexOf(dayName)
    const targetDate = new Date(startOfWeek)
    targetDate.setDate(startOfWeek.getDate() + (dayIndex === 0 ? 6 : dayIndex - 1))
    return targetDate.toISOString().split('T')[0]
  }

  // Get day name from date
  const getDayFromDate = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const date = new Date(dateString)
    return days[date.getDay()]
  }

  // Handle day selection change
  const handleDayChange = (e) => {
    const newDay = e.target.value
    setSelectedDay(newDay)
    setSelectedDate(getDateFromDay(newDay))
  }

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value
    setSelectedDate(newDate)
    setSelectedDay(getDayFromDate(newDate))
  }

  // Filter analysts and team leaders based on selected shift and day
  const getFilteredPersonnel = () => {
    if (!scheduleData[selectedDay]) {
      return { analysts: [], teamLeaders: [] }
    }

    if (selectedShift === 'all') {
      return {
        analysts: [...new Set([
          ...scheduleData[selectedDay].morning.analysts,
          ...scheduleData[selectedDay].afternoon.analysts,
          ...scheduleData[selectedDay].graveyard.analysts
        ])],
        teamLeaders: [...new Set([
          ...scheduleData[selectedDay].morning.teamLeaders,
          ...scheduleData[selectedDay].afternoon.teamLeaders,
          ...scheduleData[selectedDay].graveyard.teamLeaders
        ])]
      }
    }
    return {
      analysts: scheduleData[selectedDay][selectedShift].analysts,
      teamLeaders: scheduleData[selectedDay][selectedShift].teamLeaders
    }
  }

  // Set initial shift and day based on current time and date
  useEffect(() => {
    const currentDay = getDayFromDate(selectedDate)
    setSelectedShift(getCurrentShift())
    setSelectedDay(currentDay)
  }, [])

  const filteredPersonnel = getFilteredPersonnel()

  // Function to generate initials from name
  const getInitials = (name) => {
    return name
      .split(',')[0] // Take only the last name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  // Function to get image path for a person
  const getPersonImage = (name, isTeamLeader = false) => {
    try {
      // Remove ENGR. prefix and CPE suffix for team leaders
      const cleanName = isTeamLeader ? name.replace('ENGR. ', '').replace(', CPE', '') : name;
      // Convert name to URL-friendly format (single underscore, no extra spaces)
      const imageName = cleanName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_') // Replace one or more spaces with single underscore
        .replace(/[^a-z0-9_]/g, '') // Remove any character that's not a letter, number or underscore
        .replace(/_+/g, '_'); // Replace multiple underscores with single underscore
      return `/images/${isTeamLeader ? 'team_leaders' : 'analysts'}/${imageName}.jpg`;
    } catch (error) {
      console.error('Error getting image path:', error);
      return null;
    }
  }


  // Component for profile picture with fallback
  const ProfilePicture = ({ name, isTeamLeader }) => {
    const [showInitials, setShowInitials] = useState(false);
    const imagePath = getPersonImage(name, isTeamLeader);
    const initials = getInitials(isTeamLeader ? name.replace('ENGR. ', '') : name);
    const gradientClass = isTeamLeader ? 
      'from-yellow-500/20 to-orange-500/20' : 
      'from-cyan-500/20 to-blue-500/20';
    const textColorClass = isTeamLeader ? 'text-yellow-400' : 'text-cyan-400';

    return (
      <div className={`relative w-24 h-24 bg-gradient-to-br ${gradientClass} rounded-full mb-3 overflow-hidden`}>
        {!showInitials && (
          <div className="relative w-full h-full">
            <Image
              src={imagePath}
              alt={name}
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setShowInitials(true)}
              unoptimized
            />
          </div>
        )}
        {showInitials && (
          <div className={`flex items-center justify-center w-full h-full ${textColorClass} font-bold text-xl`}>
            {initials}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4 font-mono">
            ATRA Team Attendance
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={selectedDay}
              onChange={handleDayChange}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning (6AM-2PM)</option>
              <option value="afternoon">Afternoon (2PM-10PM)</option>
              <option value="graveyard">Graveyard (10PM-6AM)</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-gray-800 text-gray-300 border border-cyan-500/20 rounded-lg p-2 font-mono"
            />
          </div>

          {/* Current Schedule Info */}
          <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-cyan-500/20">
            <h3 className="text-yellow-400 font-mono mb-2">Current Schedule:</h3>
            <div className="text-gray-300 font-mono space-y-1">
              <p>Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Shift: {
                selectedShift === 'all' ? 'All Shifts' :
                selectedShift === 'morning' ? 'Morning (6AM-2PM)' :
                selectedShift === 'afternoon' ? 'Afternoon (2PM-10PM)' :
                'Graveyard (10PM-6AM)'
              }</p>
            </div>
          </div>

          {/* SOC Analysts Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">SOC Analysts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPersonnel.analysts.map((analyst, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex flex-col items-center">
                    <ProfilePicture name={analyst} isTeamLeader={false} />
                    <h3 className="text-gray-300 font-mono text-center mb-2">{analyst}</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm font-mono rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30">
                        Clock In
                      </button>
                      <button className="px-3 py-1 text-sm font-mono rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        Clock Out
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Leaders Section */}
          <div>
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">Team Leaders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPersonnel.teamLeaders.map((leader, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex flex-col items-center">
                    <ProfilePicture name={leader} isTeamLeader={true} />
                    <h3 className="text-gray-300 font-mono text-center mb-2">{leader}</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm font-mono rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30">
                        Clock In
                      </button>
                      <button className="px-3 py-1 text-sm font-mono rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        Clock Out
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
