import { NextResponse } from 'next/server';
import axios from 'axios';

// This route handles direct POST requests to /login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Connect to the backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await axios.post(`${apiUrl}/auth/login`, {
      email,
      password,
    });
    
    if (response.data?.user && response.data?.token) {
      // Create response with token in cookie
      const responseData = {
        success: true,
        user: {
          id: response.data.user.id,
          name: `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          role: response.data.user.role,
        }
      };
      
      // Set cookie using headers
      const cookieValue = `auth-token=${response.data.token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      
      return NextResponse.json(responseData, {
        headers: {
          'Set-Cookie': cookieValue
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({ error: error.response.data.message || 'Authentication failed' }, { status: error.response.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
