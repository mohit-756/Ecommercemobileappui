import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'sonner';

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name: string; email: string; password: string } | null;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!state?.email) {
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
      const res = await authService.verifyOtp({
        email: state!.email,
        otp: code,
        name: state!.name,
        password: state!.password,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { token, user } }));
      toast.success('Account created successfully!');
      navigate('/home', { replace: true });
    } catch (err: any) {
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
      await authService.sendOtp({ email: state!.email });
      toast.success('OTP resent to your email');
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const allFilled = otp.every(d => d !== '');

  return (
    <div className="flex flex-col h-full min-h-screen bg-white px-6 pt-16 lg:pt-8 pb-8">
      <button
        onClick={() => navigate('/login')}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 mb-8 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="mb-10">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h1>
        <p className="text-gray-500">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-gray-700">{state?.email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
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
            className="w-14 h-16 rounded-2xl border border-gray-200 bg-gray-50 text-center text-2xl font-bold text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={!allFilled || loading}
        className="w-full bg-blue-600 text-white font-semibold rounded-xl py-4 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify & Create Account'
        )}
      </button>

      <div className="text-center mt-8 text-sm">
        <span className="text-gray-500">Didn't receive the code? </span>
        {countdown > 0 ? (
          <span className="text-gray-400">Resend in {countdown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 font-semibold hover:underline disabled:text-gray-400"
          >
            {resending ? 'Resending...' : 'Resend'}
          </button>
        )}
      </div>
    </div>
  );
}
