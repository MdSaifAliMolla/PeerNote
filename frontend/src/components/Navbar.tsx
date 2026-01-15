'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

import { SessionContext, destroySessionCookie } from '../contexts/session';

export default function Navbar() {
  const linkStyle = {
    textDecoration: 'none',
    color: 'black',
    background: '#B1D4E0',
    padding: '8px 16px',
    borderRadius: '5px',
  };

  const router = useRouter();
  const session = useContext(SessionContext);

  const logout = () => {
    destroySessionCookie();
    router.push('/login');
    router.refresh();
  };

  const links = session ? (
    <>
      <div>
        <img src="/PeerNotes.png" alt="PeerNotes Logo" style={{ height: '60px' }} />
        <Link href="/register" style={linkStyle}>
          Upload
        </Link>
        <Link href="/search" style={linkStyle}>
          Search
        </Link>
        {session.isAdmin && (
          <Link href="/admin" style={linkStyle}>
            Admin
          </Link>
        )}
      </div>
      <div>
        <a onClick={logout} style={linkStyle}>
          Logout
        </a>
      </div>
    </>
  ) : (
    <Link href="/login">Login</Link>
  );

  return <nav><div>{links}</div></nav>;
}
