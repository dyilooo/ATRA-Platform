import { NextResponse } from 'next/server'

export async function POST(request) {
  const { apiKey, entry } = await request.json()
  
  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/domains/${entry}`,
      {
        headers: {
          'x-apikey': apiKey
        }
      }
    )

    const data = await response.json()
    
    if (data.data?.attributes?.last_analysis_stats) {
      return NextResponse.json({
        malicious: data.data.attributes.last_analysis_stats.malicious
      })
    }
    
    return NextResponse.json({ malicious: 0 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
