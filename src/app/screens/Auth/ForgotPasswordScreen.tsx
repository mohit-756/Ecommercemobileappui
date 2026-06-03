import { useNavigate } from "react-router";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/auth/otp");
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-6">
      <div className="mt-8 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 mb-6">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-gray-500 mt-2">Enter your email address to receive a verification code.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          leftIcon={<Mail size={20} />}
          required
        />
        
        <Button type="submit" fullWidth>
          Send Code
        </Button>
      </form>
    </div>
  );
}
