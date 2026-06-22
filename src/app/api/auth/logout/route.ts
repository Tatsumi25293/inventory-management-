import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:5000/api';

export async function POST() {
  try {
    // Forward logout request to Express.js backend
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout Proxy backend call failed:', error);
  }

  const response = NextResponse.json(
    { success: true, message: 'تم تسجيل الخروج بنجاح' },
    { status: 200 }
  );

  // Clear cookie locally in Next.js
  response.cookies.set({
    name: 'session_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
