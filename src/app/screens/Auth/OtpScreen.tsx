import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/Button";

export default function OtpScreen() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    navigate("/home");
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-6">
      <div className="mt-8 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 mb-6">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Verify Code</h1>
        <p className="text-gray-500 mt-2">Please enter the code we just sent to your email.</p>
      </div>

      <div className="flex justify-center space-x-4 mb-8 mt-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            type="number"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 text-center text-2xl font-bold text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
          />
        ))}
      </div>

      <div className="text-center mb-8 text-sm">
        <span className="text-gray-500">Didn't receive code? </span>
        <button className="text-blue-600 font-semibold hover:underline">Resend</button>
      </div>

      <Button onClick={handleSubmit} fullWidth disabled={otp.some((d) => !d)}>
        Verify
      </Button>
    </div>
  );
}
