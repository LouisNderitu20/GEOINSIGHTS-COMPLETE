'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow rounded-4 bg-surface border">
            <div className="card-body p-4 text-center">
              <img src="/logo.png" alt="GeoInsights Logo" width={100} height={100} className="mb-3" />
              <h4 className="mb-4 fw-bold text-heading">Create an Account</h4>

              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                  <label className="form-label text-heading">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label text-heading">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label text-heading">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="jane_doe"
                    required
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label text-heading">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    minLength={6}
                  />
                </div>

                {error && <div className="alert alert-danger text-start">{error}</div>}
                {success && <div className="alert alert-success text-start">Registration successful! Redirecting...</div>}

                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>

                <div className="text-center small text-body-secondary">
                  Already have an account? <Link href="/auth/login" className="text-primary">Login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
