import { NextResponse } from 'next/server';
import { signSession } from '@/lib/auth';

const DASHBOARD_USERNAME = process.env.DASHBOARD_USERNAME || 'admin';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'adminpass';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-that-is-at-least-32-characters-long';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (username === DASHBOARD_USERNAME && password === DASHBOARD_PASSWORD) {
      // Create session token (expires in 24 hours)
      const token = await signSession(username, JWT_SECRET, COOKIE_MAX_AGE);

      const response = NextResponse.json(
        { success: true, message: 'تم تسجيل الدخول بنجاح' },
        { status: 200 }
      );

      // Set cookie securely
      response.cookies.set({
        name: 'session_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
