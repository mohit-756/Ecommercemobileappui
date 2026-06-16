import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { hapticService } from '../services/hapticService';
import { IMAGE_BASE_URL } from '../services/api';

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name?: string; email?: string; password?: string; phone?: string } | null;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!state?.email && !state?.phone) {
      navigate('/login', { replace: true });
      return;
    }
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    try {
      const res = await authService.verifyOtp(
        state?.phone
          ? { phone: state.phone, otp: code }
          : {
              email: state!.email,
              otp: code,
              name: state!.name,
              password: state!.password,
            }
      );
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { token, user } }));
      hapticService.notificationSuccess();
      toast.success(state?.phone ? 'Logged in successfully!' : 'Account created successfully!');
    } catch (err: any) {
      hapticService.impact();
      const message = err.response?.data?.message || 'Invalid OTP. Try again.';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (state?.phone) {
        const res = await authService.sendOtp({ phone: state.phone });
        if (res.data.dev && res.data.otp) {
          toast.success(`Dev mode — OTP: ${res.data.otp}`, { duration: 10000 });
        } else {
          toast.success('OTP resent to your phone');
        }
      } else {
        const res = await authService.sendOtp({ email: state!.email });
        if (res.data.dev && res.data.otp) {
          toast.success(`Dev mode — OTP: ${res.data.otp}`, { duration: 10000 });
        } else {
          toast.success('OTP resent to your email');
        }
      }
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err: any) {
      hapticService.impact();
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const allFilled = otp.every(d => d !== '');

  return (
    <div className="w-full min-h-screen lg:min-h-[75vh] flex items-stretch lg:items-center justify-center bg-white dark:bg-background lg:bg-transparent transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-surface-secondary lg:rounded-3xl lg:shadow-2xl lg:border lg:border-border-medium/60 overflow-hidden transition-all duration-300 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-full lg:min-h-[600px]">
          
          {/* Left panel - Visual Showcase (desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 p-12 flex-col justify-between relative overflow-hidden text-white">
            {/* Background decorative patterns */}
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                <span className="font-black tracking-tight text-xl">DryFruit Hub</span>
              </div>
              
              <h2 className="text-3xl font-black mb-4 leading-tight">Secure Your Account</h2>
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                Enter the verification code sent to your email. We take your security seriously and ensure your shopping is safe.
              </p>
            </div>
            
            <div className="relative z-10 flex justify-center py-6">
              <img 
                src={`${IMAGE_BASE_URL}/images/promo/healthy_lifestyle.png`} 
                alt="Security Showcase" 
                className="w-56 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float"
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex gap-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              </div>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">100% Encrypted & Safe Flow</p>
            </div>
          </div>

          {/* Right panel - Form (always visible) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 py-10 pt-safe pb-safe lg:p-12 bg-white dark:bg-surface-secondary">
            <div className="w-full max-w-md mx-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-surface-secondary text-gray-900 dark:text-text-primary mb-8 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary mb-2">
                  {state?.phone ? 'Verify Phone' : 'Verify Email'}
                </h1>
                <p className="text-gray-500 dark:text-text-secondary">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-gray-700 dark:text-text-primary">
                    {state?.phone ? (state.phone.startsWith('+') ? state.phone : `+91 ${state.phone}`) : state?.email}
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => (inputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-border-medium bg-gray-50 dark:bg-surface-secondary text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-text-primary focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={!allFilled || loading}
                className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  state?.phone ? 'Verify & Continue' : 'Verify & Create Account'
                )}
              </button>

              <div className="text-center mt-8 text-sm">
                <span className="text-gray-500 dark:text-text-secondary">Didn't receive the code? </span>
                {countdown > 0 ? (
                  <span className="text-gray-400 dark:text-text-tertiary font-medium">Resend in {countdown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-blue-600 font-semibold hover:underline disabled:text-gray-400 dark:disabled:text-text-tertiary cursor-pointer"
                  >
                    {resending ? 'Resending...' : 'Resend'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
