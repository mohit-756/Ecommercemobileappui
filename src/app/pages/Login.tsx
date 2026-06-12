import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, register, user } = useAuth();
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

  useEffect(() => {
    const checkGoogle = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(checkGoogle);
        initGoogleSignIn();
      }
    }, 100);
    return () => clearInterval(checkGoogle);
  }, []);

  const initGoogleSignIn = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-copied-client-id.apps.googleusercontent.com';
    try {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          setLoading(true);
          try {
            await loginWithGoogle(response.credential);
            toast.success('Welcome back!');
            navigate('/home', { replace: true });
          } catch (err) {
            console.error('Google sign in error:', err);
            toast.error('Google sign in failed');
          } finally {
            setLoading(false);
          }
        }
      });
      
      const btnParent = document.getElementById("google-signin-btn");
      if (btnParent) {
        (window as any).google.accounts.id.renderButton(
          btnParent,
          { 
            theme: "outline", 
            size: "large", 
            type: "standard", 
            shape: "rectangular", 
            text: "continue_with", 
            height: 46,
            width: Math.min(400, Math.max(200, btnParent.clientWidth))
          }
        );
      }
    } catch (err) {
      console.error('Error rendering Google button:', err);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      let email = localStorage.getItem('bio_email');
      let password = localStorage.getItem('bio_password');

      // Demo fallback: If no credentials saved, use seeded guest credentials
      if (!email || !password) {
        email = 'guest@dryfruit.com';
        password = 'guest0000';
      }

      const auth = await biometricService.authenticate('Log in to DryFruit Hub');
      if (auth.success) {
        await login(email, password);
        toast.success('Welcome back!');
        navigate('/home', { replace: true });
      }
    } catch (err) {
      toast.error('Biometric login failed');
    } finally {
      setBiometricLoading(false);
    }
  };

  // Google sign in is handled programmatically by Google's SDK callback

  const from = '/home';

  if (user) {
    return <Navigate to={from} replace />;
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
        navigate('/home', { replace: true });
      } else {
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const res = await authService.sendOtp({ email });
        if (res.data.dev && res.data.otp) {
          toast.success(`Dev mode — OTP: ${res.data.otp}`, { duration: 10000 });
        } else {
          toast.success('OTP sent to your email');
        }
        navigate('/verify-otp', { state: { name, email, password } });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] lg:min-h-[75vh] flex items-center justify-center bg-white dark:bg-background lg:bg-transparent py-4 lg:py-10 transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-surface-secondary lg:rounded-3xl lg:shadow-2xl lg:border lg:border-border-medium/60 overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px]">
          
          {/* Left panel - Visual Showcase (desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 p-12 flex-col justify-between relative overflow-hidden text-white">
            {/* Background decorative patterns */}
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-2xl">🍂</span>
                <span className="font-black tracking-tight text-xl">DryFruit Hub</span>
              </div>
              
              <h2 className="text-3xl font-black mb-4 leading-tight">Taste Nature's Finest Goodness</h2>
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                Sourced from the best organic orchards. Handpicked, sorted, and packed to preserve natural crunch and nutrition.
              </p>
            </div>
            
            <div className="relative z-10 flex justify-center py-6">
              <img 
                src="/images/banners/mixed_nuts.png" 
                alt="Dry Fruits Showcase" 
                className="w-56 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float"
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex gap-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              </div>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">Premium Quality Guaranteed</p>
            </div>
          </div>

          {/* Right panel - Form (always visible) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 py-10 lg:p-12 bg-white dark:bg-surface-secondary">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary mb-2">
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h1>
                <p className="text-gray-500 dark:text-text-secondary">
                  {isLogin ? 'Sign in to continue shopping.' : 'Sign up to get started.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1.5">Full Name</label>
                    <div className="relative">
                      <input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-text-tertiary">
                      <Mail size={20} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-text-tertiary">
                      <Lock size={20} />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-3.5 pl-11 pr-12 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-text-tertiary hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 mt-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-border-light"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-surface-secondary text-gray-500 dark:text-text-secondary transition-colors">Or continue with</span>
                  </div>
                </div>

                <div className="w-full flex justify-center">
                  <div 
                    id="google-signin-btn" 
                    className="w-full max-w-sm min-h-[46px] flex items-center justify-center overflow-hidden"
                  >
                    {/* Google Sign-in iframe renders here */}
                  </div>
                </div>

                {biometricAvailable && isLogin && (
                  <button
                    type="button"
                    disabled={biometricLoading}
                    onClick={handleBiometricLogin}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold rounded-xl py-3.5 mt-2 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Fingerprint size={20} />
                    {biometricLoading ? 'Authenticating...' : 'Login with Fingerprint'}
                  </button>
                )}
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-500 dark:text-text-secondary text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
