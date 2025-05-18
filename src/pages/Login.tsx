import { useState } from "react";
import { Eye, EyeOff, User, Building } from "lucide-react";

const Login = () => {
  const [accountType, setAccountType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const requestBody = {
        email: loginData.email,
        password: loginData.password,
        role: accountType === "professional" ? "agent" : "individual"
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include"
      });
      
      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      localStorage.setItem("token", data.token);
      
      // Simulating toast notification
      alert("Login Successful: You have been logged in successfully.");
      
      // Redirect to home page
      setTimeout(() => window.location.href = "/", 500);
    } catch (error) {
      // Simulating toast notification
      alert(`Login Failed: ${error instanceof Error ? error.message : "Invalid credentials"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="PropertyMauritius Logo" className="h-32 object-contain mx-auto" />
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700">Login to your account</h2>
              <p className="text-gray-600 mt-1">Access your PropertyMauritius account</p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-1 flex mb-6">
              <button 
                className={`flex-1 flex items-center justify-center rounded-md py-2 transition-all ${
                  accountType === "individual" 
                    ? "bg-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setAccountType("individual")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Individual</span>
              </button>
              <button 
                className={`flex-1 flex items-center justify-center rounded-md py-2 transition-all ${
                  accountType === "professional" 
                    ? "bg-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setAccountType("professional")}
              >
                <Building className="mr-2 h-4 w-4" />
                <span>Professional</span>
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={loginData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-2 space-y-4">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a href="/register" className="text-teal-600 hover:text-teal-800 font-medium">
                Register here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;