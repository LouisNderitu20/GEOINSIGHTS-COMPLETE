'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const contentType = res.headers.get('content-type');

      if (!res.ok) {
        if (contentType?.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Login failed');
        } else {
          throw new Error('Unexpected response from server');
        }
      }

      const data = await res.json();

      if (!data.token) throw new Error('Missing token in response');

      localStorage.setItem('token', data.token);

      router.push('/dashboard');
      localStorage.setItem('token', data.token);
          setTimeout(() => {
          window.location.href = '/dashboard';
          }, 100);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 text-center">
            <img src="/logo.png" alt="GeoInsights Logo" width={100} height={100} className="mb-3" />
            <h4 className="mb-4 fw-bold text-heading">Login to GeoInsights</h4>

            <form onSubmit={handleSubmit} className="text-start">
              <div className="mb-3">
                <label htmlFor="identifier" className="form-label text-heading">Email or Username</label>
                <input
                  type="text"
                  id="identifier"
                  className="form-control"
                  placeholder="you@example.com or johndoe"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label text-heading">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger text-start">{error}</div>
              )}

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
              <div className="text-center small">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary fw-semibold text-decoration-none">
                  Register
                </Link>
                <span className="mx-2 text-muted">|</span>
                <Link href="/forgot-password" className="text-primary text-decoration-none">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
