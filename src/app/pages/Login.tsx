import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Fingerprint, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { biometricService } from '../services/biometricService';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { toast } from 'sonner';
import { IMAGE_BASE_URL } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, register, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    biometricService.checkAvailability().then(res => {
      setBiometricAvailable(res.available);
    });
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        GoogleAuth.initialize();
      } catch (err) {
        console.warn('GoogleAuth initialize warning:', err);
      }
      return;
    }

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
          } catch (err: any) {
            console.error('Google sign in error:', err);
            const errMsg = err.response?.data?.message || err.message || err;
            toast.error(`Google sign in failed: ${errMsg}`);
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

  const handleNativeGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Starting Native Google Sign-In...');
      const googleUser = await GoogleAuth.signIn().catch(e => {
        throw { source: 'plugin', inner: e };
      });

      const idToken = googleUser.authentication.idToken;
      if (!idToken) {
        throw { source: 'plugin', message: 'No ID Token returned from Google Auth' };
      }

      console.log('ID Token received, calling backend...');
      await loginWithGoogle(idToken).catch(e => {
        throw { source: 'backend', inner: e };
      });

      toast.success('Welcome back!');
    } catch (err: any) {
      console.error('Native Google Sign-In Error:', err);

      let errorDetail = '';
      const source = err.source || 'unknown';
      const actualErr = err.inner || err;

      if (actualErr.response) {
        // Backend error (Axios)
        const errMsg = actualErr.response?.data?.message || actualErr.message;
        const errStatus = actualErr.response?.status ? ` [Status ${actualErr.response.status}]` : '';
        const errData = actualErr.response?.data ? ` - ${JSON.stringify(actualErr.response.data)}` : '';
        errorDetail = `${errMsg}${errStatus}${errData}`;
      } else {
        // Native Plugin or Network error
        errorDetail = actualErr.message || JSON.stringify(actualErr) || 'Unknown error';
      }
      
      // Don't show error if user cancelled
      const isCancelled = errorDetail.includes('userCancelled') ||
                         errorDetail.includes('12501') ||
                         actualErr.code === '12501' ||
                         (typeof actualErr === 'string' && actualErr.includes('cancel'));

      if (!isCancelled) {
        toast.error(`Google sign in failed (${source}): ${errorDetail}`);
      }
    } finally {
      setLoading(false);
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
      }
    } catch (err) {
      toast.error('Biometric login failed');
    } finally {
      setBiometricLoading(false);
    }
  };

  // Google sign in is handled programmatically by Google's SDK callback

  const locationState = location.state as { from?: { pathname: string } } | null;
  const from = user?.role === 'admin' ? '/admin' : (locationState?.from?.pathname || '/home');
  
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const getPhoneValidationError = () => {
    if (!phoneNumber) return '';
    if (phoneNumber.length < 10) {
      return 'Enter a valid 10-digit mobile number';
    }
    return '';
  };

  const phoneValidationError = getPhoneValidationError();
  const isPhoneValid = phoneNumber.length === 10;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) return;

    setPhoneLoading(true);
    try {
      const res = await authService.sendOtp({ phone: phoneNumber });
      if (res.data.dev && res.data.otp) {
        toast.success(`Dev mode — OTP: ${res.data.otp}`, { duration: 10000 });
      } else {
        toast.success('OTP sent to your phone number');
      }
      setIsPhoneModalOpen(false);
      navigate('/verify-otp', { state: { phone: phoneNumber } });
    } catch (err: any) {
      console.error('Phone OTP send error:', err);
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setPhoneLoading(false);
    }
  };

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
    <div className="w-full min-h-screen flex items-stretch lg:items-center justify-center bg-white dark:bg-background lg:bg-gray-50 dark:lg:bg-background transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-surface-secondary lg:rounded-3xl lg:shadow-2xl lg:border lg:border-border-medium/60 overflow-hidden transition-all duration-300 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-full lg:min-h-[500px]">
          
          {/* Left panel - Visual Showcase (desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 p-8 flex-col justify-between relative overflow-hidden text-white">
            {/* Background decorative patterns */}
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                <span className="font-black tracking-tight text-xl">DryFruit Hub</span>
              </div>
              
              <h2 className="text-2xl font-black mb-3 leading-tight">Taste Nature's Finest Goodness</h2>
              <p className="text-white/80 text-xs leading-relaxed font-medium">
                Sourced from the best organic orchards. Handpicked, sorted, and packed to preserve natural crunch and nutrition.
              </p>
            </div>
            
            <div className="relative z-10 flex justify-center py-4">
              <img 
                src={`${IMAGE_BASE_URL}/images/promo/mixed_nuts.png`} 
                alt="Dry Fruits Showcase" 
                className="w-40 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float"
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
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 py-8 pt-safe pb-safe lg:px-10 lg:py-8 bg-white dark:bg-surface-secondary">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-1.5">
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h1>
                <p className="text-gray-500 dark:text-text-secondary text-sm">
                  {isLogin ? 'Sign in to continue shopping.' : 'Sign up to get started.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-text-primary mb-1.5">Full Name</label>
                    <div className="relative">
                      <input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-text-primary mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-text-tertiary">
                      <Mail size={16} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-text-primary mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-text-tertiary">
                      <Lock size={16} />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-text-tertiary hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 mt-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-border-light"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-surface-secondary text-gray-500 dark:text-text-secondary transition-colors">Or continue with</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {Capacitor.isNativePlatform() ? (
                    <button
                      type="button"
                      onClick={handleNativeGoogleSignIn}
                      className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-white dark:bg-surface border border-gray-200 dark:border-border-medium hover:bg-gray-50 dark:hover:bg-surface-secondary text-gray-700 dark:text-text-primary font-semibold rounded-xl py-3 px-4 active:scale-[0.98] transition-all cursor-pointer shadow-sm min-h-[46px]"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="text-sm font-semibold">Continue with Google</span>
                    </button>
                  ) : (
                    <div className="w-full flex justify-center">
                      <div 
                        id="google-signin-btn" 
                        className="w-full max-w-sm min-h-[46px] flex items-center justify-center overflow-hidden"
                      >
                        {/* Google Sign-in iframe renders here */}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-white dark:bg-surface border border-gray-200 dark:border-border-medium hover:bg-gray-50 dark:hover:bg-surface-secondary text-gray-700 dark:text-text-primary font-semibold rounded-xl py-3 px-4 active:scale-[0.98] transition-all cursor-pointer shadow-sm min-h-[46px]"
                  >
                    <Phone size={20} className="text-gray-500 dark:text-text-secondary" />
                    <span className="text-sm font-semibold">Continue with Phone Number</span>
                  </button>
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
      {/* Phone Number Input Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-surface-secondary rounded-2xl border border-gray-200 dark:border-border-medium/60 shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary mb-2">Phone Login</h3>
            <p className="text-sm text-gray-500 dark:text-text-secondary mb-4">
              Enter your phone number to receive a verification OTP.
            </p>
            
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-primary mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-text-tertiary">
                    <span className="text-sm font-semibold select-none">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full bg-gray-50 dark:bg-surface border border-gray-200 dark:border-border-medium text-gray-900 dark:text-text-primary rounded-xl py-3.5 pl-14 pr-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                {phoneValidationError && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {phoneValidationError}
                  </p>
                )}
                {isPhoneValid && (
                  <p className="text-xs text-green-500 mt-1.5 font-medium animate-in fade-in duration-200">
                    ✓ Valid mobile number
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-surface dark:hover:bg-surface-secondary border border-gray-200 dark:border-border-medium text-gray-700 dark:text-text-primary font-semibold rounded-xl py-3 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isPhoneValid || phoneLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {phoneLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
