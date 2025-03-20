import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
  try {
    // Get the authorization header
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Check for environment variables
    if (!process.env.NEXT_PUBLIC_STELLAR_API_URL) {
      console.error('Missing API URL in environment variables');
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_STELLAR_API_URL + '/servers';
    console.log('Calling Stellar API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Special handling for 401 errors
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication failed',
            details: 'Invalid or expired token. Please log in again.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: `HTTP error! status: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
} 