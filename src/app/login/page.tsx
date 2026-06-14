'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to dashboard or previous page
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px] mx-4 transition-all duration-500">
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl p-8 md:p-10 flex flex-col items-center">
        
        {/* Logo & Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 border border-white/10 animate-bounce-slow">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-center tracking-tight text-white/95 mb-2">
          مستودع المخزون المحلي
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8 font-light">
          يرجى تسجيل الدخول للوصول إلى لوحة التحكم
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          {error && (
            <div className="text-xs text-red-300 bg-red-950/40 border border-red-500/30 backdrop-blur-md rounded-xl p-3 text-center transition-all duration-300">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium mr-1">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md transition-all duration-300 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-medium mr-1">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl pr-10 pl-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md transition-all duration-300 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full overflow-hidden mt-2 group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <span className="relative z-10">
              {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>
        
        {/* Footer Demo Info */}
        <div className="mt-8 text-center">
          <span className="text-[10px] text-gray-500 bg-white/[0.02] border border-white/[0.05] rounded-full px-3 py-1 backdrop-blur-sm select-none">
            حساب تجريبي: admin / adminpass
          </span>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div dir="rtl" className="relative min-h-screen w-full flex items-center justify-center bg-[#08090d] text-white overflow-hidden font-sans">
      
      {/* Background Glowing Blobs - Apple Style */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Grid Overlay for Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-3xl w-full max-w-[420px] min-h-[300px]">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-gray-400">جاري التحميل...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
