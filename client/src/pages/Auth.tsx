import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@shared/schema';

const Auth: React.FC = () => {
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: ''
  });

  // Register form state
  const [registerCredentials, setRegisterCredentials] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Login mutation
  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || '登录失败');
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: '登录成功',
        description: `欢迎回来，${user.displayName}！`,
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Register mutation
  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: async (credentials: typeof registerCredentials) => {
      const res = await apiRequest('POST', '/api/auth/register', credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || '注册失败');
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: '注册成功',
        description: `欢迎加入，${user.displayName}！`,
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: '注册失败',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle login form submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginCredentials);
  };

  // Handle register form submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (registerCredentials.password !== registerCredentials.confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '请确保两次输入的密码相同',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(registerCredentials.email)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入有效的邮箱地址',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit registration
    register(registerCredentials);
  };

  // Auto-login with default user (for testing)
  const handleAutoLogin = () => {
    login({ username: 'demo', password: 'password' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ADHD助手</CardTitle>
          <CardDescription className="text-center">
            登录或注册账号开始使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="请输入用户名" 
                    value={loginCredentials.username}
                    onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      忘记密码?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="请输入密码" 
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">显示名称</Label>
                  <Input 
                    id="displayName" 
                    type="text" 
                    placeholder="请输入您的名称" 
                    value={registerCredentials.displayName}
                    onChange={(e) => setRegisterCredentials({...registerCredentials, displayName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-username">用户名</Label>
                  <Input 
                    id="reg-username" 
                    type="text" 
                    placeholder="请创建用户名" 
                    value={registerCredentials.username}
                    onChange={(e) => setRegisterCredentials({...registerCredentials, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="请输入邮箱地址" 
                    value={registerCredentials.email}
                    onChange={(e) => setRegisterCredentials({...registerCredentials, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">密码</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="请创建密码" 
                    value={registerCredentials.password}
                    onChange={(e) => setRegisterCredentials({...registerCredentials, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="请再次输入密码" 
                    value={registerCredentials.confirmPassword}
                    onChange={(e) => setRegisterCredentials({...registerCredentials, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isRegistering}
                >
                  {isRegistering ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleAutoLogin}
          >
            测试账号登录
          </Button>
          <p className="text-xs text-center text-neutral-500 mt-2">
            继续使用即表示您同意我们的
            <a href="#" className="text-primary hover:underline mx-1">服务条款</a>
            和
            <a href="#" className="text-primary hover:underline mx-1">隐私政策</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;