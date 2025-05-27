'use client';

import { BottomNavigationBar } from '@/components/shared/BottomNavigationBar';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppStore((state) => state.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    // Optional: Render a loading state or null while redirecting
    return <div className="flex h-screen w-screen items-center justify-center"><p>Loading user...</p></div>; 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow pb-16 md:pb-0">{children}</main>
      <BottomNavigationBar />
    </div>
  );
}
