'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useERPStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, token, login, isLoading } = useERPStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // If no token, redirect to login
      if (!token && pathname !== '/login') {
        router.push('/login');
        return;
      }

      // If we have a token but no user, try to login (sync user)
      if (token && !user) {
        const success = await login(token);
        if (!success) {
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [token, user, pathname, router, login]);

  // If on login page, just show children
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (!user && token) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Menyamaikasi Kredensial Nexus...</p>
      </div>
    );
  }

  // If no user and no token (and not on login page), we're redirecting, show nothing
  if (!user && !token) {
    return null;
  }

  return <>{children}</>;
}
