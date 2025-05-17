import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const Login = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"individual" | "professional">("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
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
      queryClient.invalidateQueries(["user"]);
      
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
        duration: 3000,
      });
      
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <span className="text-2xl font-bold text-teal-600">Property</span>
            <span className="text-2xl font-bold text-blue-800">Mauritius</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login to your account</CardTitle>
            <CardDescription className="text-center">Access your PropertyMauritius account</CardDescription>
          </CardHeader>
          
          <Tabs value={accountType} onValueChange={(v) => setAccountType(v as "individual" | "professional")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="individual" className="flex items-center">
                <User className="mr-2 h-4 w-4" />Individual
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />Professional
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={loginData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={loginData.password}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-teal-600 hover:text-teal-800 font-medium">Register here</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;