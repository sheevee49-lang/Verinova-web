'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const USER_TYPES = ['Individual', 'Farmer', 'Skilled Professional', 'Business', 'NGO', 'Government Agency', 'Investor', 'Youth'];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(path: string, body: Record<string, unknown>) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      router.push('/dashboard/discover');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    submit('login', { email: form.get('email'), password: form.get('password') });
  }

  function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    submit('register', {
      full_name: form.get('full_name'),
      email: form.get('email'),
      password: form.get('password'),
      user_type: form.get('user_type'),
      location: form.get('location'),
    });
  }

  return (
    <section className="auth-screen">
      <div className="auth-wrap">
        <div className="auth-hero">
<Image
  src="/logo.png"
  alt="VeriNova Technologies"
  width={907}
  height={651}
  className="brand-logo"
  style={{ height: '110px', width: 'auto' }}
  priority
/>
          <h1>Millions of ideas.<br />One place to meet.</h1>
          <p className="hero-copy">
            Innovation that connects. Technology that empowers. VeriNova Connect brings farmers,
            professionals, businesses, NGOs, and youth together through shared interests, skills, and place.
          </p>
          <ul className="hero-stats">
            <li><span className="num">01</span> Build a profile that shows what you offer</li>
            <li><span className="num">02</span> Find people and communities near you</li>
            <li><span className="num">03</span> Join, connect, and create opportunity</li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')} type="button">
              Log in
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')} type="button">
              Create account
            </button>
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>Email
                <input type="email" name="email" required autoComplete="email" />
              </label>
              <label>Password
                <input type="password" name="password" required autoComplete="current-password" />
              </label>
              <p className="form-error">{error}</p>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in…' : 'Log in'}
              </button>
              <p className="auth-hint">New here? Use "Create account" above.</p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label>Full name
                <input type="text" name="full_name" required />
              </label>
              <label>Email
                <input type="email" name="email" required autoComplete="email" />
              </label>
              <label>Password
                <input type="password" name="password" required minLength={6} autoComplete="new-password" />
              </label>
              <label>I am a...
                <select name="user_type" defaultValue="Individual">
                  {USER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>Location (e.g. county / town)
                <input type="text" name="location" placeholder="Nairobi" />
              </label>
              <p className="form-error">{error}</p>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
