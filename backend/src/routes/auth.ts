import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const DASHBOARD_USERNAME = process.env.DASHBOARD_USERNAME || 'admin';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'adminpass';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-that-is-at-least-32-characters-long';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

// Login Route
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'يرجى إدخال اسم المستخدم وكلمة المرور' 
    });
  }

  if (username === DASHBOARD_USERNAME && password === DASHBOARD_PASSWORD) {
    // Generate JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

    // Set secure cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });

    return res.status(200).json({ 
      success: true, 
      message: 'تم تسجيل الدخول بنجاح',
      token // also return token for header authorization fallback
    });
  }

  return res.status(401).json({ 
    success: false, 
    error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
  });
});

// Logout Route
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  return res.status(200).json({ 
    success: true, 
    message: 'تم تسجيل الخروج بنجاح' 
  });
});

// Verify Session Route
router.get('/verify', (req: Request, res: Response) => {
  // Get token from cookies or Authorization header
  const token = req.cookies.session_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(200).json({ 
      authenticated: false, 
      error: 'لا توجد جلسة نشطة' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    return res.status(200).json({ 
      authenticated: true, 
      username: decoded.username 
    });
  } catch (error) {
    return res.status(200).json({ 
      authenticated: false, 
      error: 'انتهت صلاحية الرمز أو غير صالح' 
    });
  }
});

export default router;
