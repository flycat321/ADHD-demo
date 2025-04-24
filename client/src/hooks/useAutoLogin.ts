import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useStore } from '@/store';
import { User } from '@shared/schema';

export function useAutoLogin() {
  const { setCurrentUser, currentUser, isAuthenticated } = useStore();
  const [isAutoLoginAttempted, setIsAutoLoginAttempted] = useState(false);

  // Auto login mutation
  const { mutate: autoLogin, isPending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/login', {
        username: 'demo',
        password: 'password'
      });
      if (!res.ok) {
        throw new Error('自动登录失败');
      }
      return res.json() as Promise<User>;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
    },
    onError: () => {
      // Silent fail for auto login
      console.log('自动登录失败，用户需要手动登录');
    },
    onSettled: () => {
      setIsAutoLoginAttempted(true);
    }
  });

  useEffect(() => {
    // Only attempt auto-login if not already authenticated and not already attempted
    if (!isAuthenticated && !currentUser && !isAutoLoginAttempted && !isPending) {
      autoLogin();
    }
  }, [isAuthenticated, currentUser, isAutoLoginAttempted, isPending, autoLogin]);

  return { isAutoLoginAttempted, isPending };
}