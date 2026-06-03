import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function SignupScreen() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/auth/otp");
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-6 overflow-y-auto">
      <div className="mt-10 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Account ✨</h1>
        <p className="text-gray-500 mt-2">Sign up to get started</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4 flex-1">
        <Input 
          label="Full Name"
          placeholder="Enter your name"
          type="text"
          leftIcon={<User size={20} />}
          required
        />
        
        <Input 
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          leftIcon={<Mail size={20} />}
          required
        />
        
        <Input 
          label="Password"
          placeholder="Create a password"
          type={showPass ? "text" : "password"}
          leftIcon={<Lock size={20} />}
          rightIcon={
            <button type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          required
        />

        <div className="pt-4">
          <Button type="submit" fullWidth>
            Sign Up
          </Button>
        </div>
      </form>

      <div className="mt-auto pt-8 text-center text-sm text-gray-600 pb-safe">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-blue-600 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
