import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:5000/api';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call Express.js backend login endpoint
    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (backendRes.ok && data.success) {
      const response = NextResponse.json(
        { success: true, message: data.message },
        { status: 200 }
      );

      // Set cookie in Next.js response to match Express JWT token
      response.cookies.set({
        name: 'session_token',
        value: data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: data.error || 'خطأ في عملية تسجيل الدخول' },
      { status: backendRes.status }
    );
  } catch (error) {
    console.error('Login Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'تعذر الاتصال بخادم الباكند' },
      { status: 500 }
    );
  }
}
