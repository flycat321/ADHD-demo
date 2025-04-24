import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useStore } from "@/store";
import { User } from "@shared/schema";
import { 
  Brain, 
  User as UserIcon, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  ArrowRight, 
  AtSign,
  Sparkles
} from "lucide-react";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setCurrentUser, isAuthenticated } = useStore();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Auto login functionality
  useAutoLogin();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    displayName: ""
  });
  
  // Login mutation
  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "登录失败");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      navigate("/");
      toast({
        title: "登录成功",
        description: `欢迎回来，${user.displayName}！`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Register mutation
  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: async (userData: typeof registerData) => {
      const { confirmPassword, ...userDataToSend } = userData;
      const res = await apiRequest("POST", "/api/auth/register", userDataToSend);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "注册失败");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      navigate("/");
      toast({
        title: "注册成功",
        description: "您的账户已创建并已自动登录",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle login form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginData);
  };
  
  // Handle register form submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保您的密码和确认密码相同",
        variant: "destructive",
      });
      return;
    }
    
    register(registerData);
  };
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 opacity-90"></div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="0.15" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,170.7C960,171,1056,213,1152,224C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500 opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-purple-300 opacity-10 animate-pulse"></div>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md">
          {/* App Logo */}
          <motion.div 
            className="mb-8 text-center"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center bg-white rounded-full p-3 shadow-lg mb-4">
              <Brain className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">专注生活</h1>
            <p className="text-white/80 text-lg">为ADHD患者定制的全面支持平台</p>
          </motion.div>

          {/* Auth Card */}
          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <Tabs 
                  defaultValue={activeTab} 
                  onValueChange={setActiveTab} 
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=inactive]:text-white/80"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      登录
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register"
                      className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=inactive]:text-white/80"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      注册
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="px-6 pb-8 pt-4">
                <AnimatePresence mode="wait">
                  {/* Login Form */}
                  {activeTab === "login" && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-username" className="text-white">用户名</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <AtSign className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="login-username"
                              placeholder="输入用户名"
                              type="text"
                              value={loginData.username}
                              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-white">密码</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="login-password"
                              placeholder="输入密码"
                              type="password"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={isLoginPending}
                            className="w-full bg-white hover:bg-white/90 text-indigo-700 font-medium"
                          >
                            {isLoginPending ? "登录中..." : (
                              <span className="flex items-center">
                                登录
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <a href="#" className="text-white/70 hover:text-white">忘记密码?</a>
                          <button 
                            type="button" 
                            onClick={() => setActiveTab("register")} 
                            className="text-white/70 hover:text-white"
                          >
                            没有账号? 注册
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                  
                  {/* Register Form */}
                  {activeTab === "register" && (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-username" className="text-white">用户名</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <AtSign className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="register-username"
                              placeholder="创建用户名"
                              type="text"
                              value={registerData.username}
                              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-display-name" className="text-white">显示名称</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="register-display-name"
                              placeholder="您希望被如何称呼"
                              type="text"
                              value={registerData.displayName}
                              onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-white">电子邮箱</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="register-email"
                              placeholder="your@email.com"
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-white">密码</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="register-password"
                              placeholder="创建密码"
                              type="password"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password" className="text-white">确认密码</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-white/50" />
                            </div>
                            <Input
                              id="register-confirm-password"
                              placeholder="再次输入密码"
                              type="password"
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                              required
                              className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={isRegistering}
                            className="w-full bg-white hover:bg-white/90 text-indigo-700 font-medium"
                          >
                            {isRegistering ? "注册中..." : (
                              <span className="flex items-center">
                                创建账号
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex justify-center text-sm">
                          <button 
                            type="button" 
                            onClick={() => setActiveTab("login")} 
                            className="text-white/70 hover:text-white"
                          >
                            已有账号? 登录
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Features Showcase */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 px-2"
          >
            <div className="flex justify-between">
              <div className="text-center flex-1">
                <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm">专注工具</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm">知识库</p>
              </div>
              <div className="text-center flex-1">
                <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-2">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm">社区</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                专注于生活，而不是挑战
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;