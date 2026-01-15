'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

import '../../../styles/Login.css';
import { useSessionRedirect } from '../../../hooks/sessionRedirect';
import { getCentralServerBaseUrl } from '../../../utils/env';

export default function LoginPage() {
  const router = useRouter();

  useSessionRedirect();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username');
    const password = formData.get('password');

    fetch(`${getCentralServerBaseUrl()}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('isAdmin', String(!!data.is_admin));
          router.push('/search');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <main>
      <form className="login-container" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="form-input">
          <label htmlFor="username">Username</label>
          <input type="text" name="username" id="username" />
        </div>
        <div className="form-input">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" />
        </div>
        <button className="submit-button">Login</button>
        <p>
          or <Link href="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
