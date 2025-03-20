import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      console.error('Missing credentials');
      return NextResponse.json(
        { 
          error: 'Missing credentials',
          details: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    // Log the environment variables (without sensitive data)
    console.log('Environment check:', {
      hasApiUrl: !!process.env.NEXT_PUBLIC_STELLAR_API_URL,
      apiUrlValue: process.env.NEXT_PUBLIC_STELLAR_API_URL
    });

    const baseUrl = process.env.NEXT_PUBLIC_STELLAR_API_URL?.trim();
    if (!baseUrl) {
      console.error('Missing or invalid API URL');
      return NextResponse.json(
        { 
          error: 'Configuration error',
          details: 'API URL is not properly configured'
        },
        { status: 500 }
      );
    }

    // Ensure the URL is properly formatted
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/access_token`;
    console.log('Full API URL:', apiUrl);

    // Create Basic auth string exactly as shown in Swagger UI
    const credentials = `${username}:${password}`;
    const authString = Buffer.from(credentials).toString('base64');
    
    // Log the exact request we're making
    console.log('Making request:', {
      url: apiUrl,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'accept': 'application/json',  // lowercase to match Swagger UI
        'Content-Type': 'application/json'  // Add Content-Type header
      }
    });

    // Make request exactly matching Swagger UI format
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'accept': 'application/json',  // lowercase to match Swagger UI
        'Content-Type': 'application/json'  // Add Content-Type header
      }
    });

    // Log the raw response details
    console.log('Raw Stellar API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stellar API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Log the exact credentials being used (encoded)
      console.log('Debug - Auth header being used:', `Basic ${authString}`);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Invalid username or password',
            details: 'The credentials provided were not accepted by the Stellar API. Please verify your username and password.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: errorText || 'Unable to authenticate with Stellar API'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Authentication response data:', {
      hasToken: !!data.access_token,
      hasExp: !!data.exp,
      tokenLength: data.access_token ? data.access_token.length : 0
    });
    
    if (!data.access_token) {
      console.error('Invalid API response structure:', {
        hasData: !!data,
        keys: data ? Object.keys(data) : []
      });
      return NextResponse.json(
        { 
          error: 'Invalid API response',
          details: 'The authentication was successful but no access token was provided'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      token: data.access_token,
      exp: data.exp
    });

  } catch (error) {
    console.error('Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message || 'An unexpected error occurred during authentication'
      },
      { status: 500 }
    );
  }
} 