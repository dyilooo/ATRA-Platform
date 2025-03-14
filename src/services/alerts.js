export const fetchAlerts = async () => {
  const response = await fetch('/api/alerts')
  if (!response.ok) throw new Error('Failed to fetch alerts')
  return response.json()
}

export const updateAlertStatus = async (alertId, status) => {
  const response = await fetch(`/api/alerts/${alertId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status })
  })
  if (!response.ok) throw new Error('Failed to update alert status')
  return response.json()
} 