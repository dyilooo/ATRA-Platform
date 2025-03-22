import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'Valid Bearer token is required'
        },
        { status: 401 }
      );
    }

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
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/alert_types`;
    console.log('Fetching alert types from:', apiUrl);

    // Forward the token in the request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stellar API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed',
            details: 'The provided token was not accepted by the Stellar API'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to fetch alert types',
          details: errorText || 'Unable to fetch alert types from Stellar API'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Alert types fetch error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch alert types',
        details: error.message || 'An unexpected error occurred while fetching alert types'
      },
      { status: 500 }
    );
  }
} 