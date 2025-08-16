// src/app/api/auth/revoke/route.ts
import { auth } from "@/auth"
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:5125';

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the token from request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Call the identity service to revoke the token
    const response = await fetch(`${IDENTITY_SERVICE_URL}/api/auth/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error('Failed to revoke token:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to revoke token' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}