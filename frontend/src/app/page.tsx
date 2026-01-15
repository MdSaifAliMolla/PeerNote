'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getSessionCookie } from '../contexts/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getSessionCookie();
    router.replace(session?.token ? '/search' : '/login');
  }, [router]);

  return null;
}
