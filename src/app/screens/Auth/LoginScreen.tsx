import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="flex-1 bg-white flex flex-col p-6 overflow-y-auto">
      <div className="mt-12 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back! 👋</h1>
        <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 flex-1">
        <Input 
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          leftIcon={<Mail size={20} />}
          required
        />
        
        <div>
          <Input 
            label="Password"
            placeholder="Enter your password"
            type={showPass ? "text" : "password"}
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            required
          />
          <div className="flex justify-end mt-2">
            <Link to="/auth/forgot-password" className="text-sm font-medium text-blue-600">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth className="mt-8">
          Sign In
        </Button>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button type="button" variant="outline" className="flex space-x-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>Google</span>
          </Button>
          <Button type="button" variant="outline" className="flex space-x-2">
            <img src="https://www.svgrepo.com/show/475647/apple-color.svg" className="w-5 h-5" alt="Apple" />
            <span>Apple</span>
          </Button>
        </div>
      </form>

      <div className="mt-auto pt-8 text-center text-sm text-gray-600 pb-safe">
        Don't have an account?{" "}
        <Link to="/auth/signup" className="text-blue-600 font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
