'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Navbar from './Navbar';
import { SessionContext, getSessionCookie } from '../contexts/session';
import { usePoll } from '../hooks/usePoll';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<ReturnType<typeof getSessionCookie>>(null);
  const router = useRouter();
  const pathname = usePathname();

  usePoll();

  useEffect(() => {
    const nextSession = getSessionCookie();
    setSession(nextSession);
    if (!nextSession?.token && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [pathname, router]);

  return (
    <SessionContext.Provider value={session}>
      <Navbar />
      <div className="App">{children}</div>
    </SessionContext.Provider>
  );
}
