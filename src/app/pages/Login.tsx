import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Apple, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { biometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    biometricService.checkAvailability().then(res => {
      setBiometricAvailable(res.available);
    });
  }, []);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const savedEmail = localStorage.getItem('bio_email');
      const savedPassword = localStorage.getItem('bio_password');
      if (!savedEmail || !savedPassword) {
        toast.error('Please log in manually first to enable biometric login');
        return;
      }
      const auth = await biometricService.authenticate('Log in to Luminar');
      if (auth.success) {
        await login(savedEmail, savedPassword);
        toast.success('Welcome back!');
        navigate('/home', { replace: true });
      }
    } catch {
      toast.error('Biometric login failed');
    } finally {
      setBiometricLoading(false);
    }
  };

  const from = (location.state as any)?.from?.pathname || '/home';

  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      if (isLogin) {
        await login(email, password);
        if (biometricAvailable) {
          localStorage.setItem('bio_email', email);
          localStorage.setItem('bio_password', password);
        }
        toast.success('Welcome back!');
      } else {
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        await register(name, email, password);
        toast.success('Account created successfully!');
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-white px-6 pt-16 pb-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-500">
          {isLogin ? 'Sign in to continue shopping.' : 'Sign up to get started.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail size={20} />
            </div>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Lock size={20} />
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3.5 pl-11 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="flex justify-end">
            <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 mt-4 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : (
            isLogin ? 'Sign In' : 'Sign Up'
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3.5 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-gray-700">Google</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3.5 hover:bg-gray-50 transition-colors">
            <Apple size={20} className="text-black" />
            <span className="font-medium text-gray-700">Apple</span>
          </button>
        </div>

        {biometricAvailable && isLogin && (
          <button
            type="button"
            disabled={biometricLoading}
            onClick={handleBiometricLogin}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold rounded-xl py-3.5 mt-2 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <Fingerprint size={20} />
            {biometricLoading ? 'Authenticating...' : 'Login with Fingerprint'}
          </button>
        )}
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
