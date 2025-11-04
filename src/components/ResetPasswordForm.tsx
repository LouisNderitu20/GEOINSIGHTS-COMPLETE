'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="min-vh-100 d-flex align-items-center py-4">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow border-0">
                <div className="card-body p-4 text-center">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mb-0">Validating reset link...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-vh-100  d-flex align-items-center py-4">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow border-0">
                <div className="card-body p-4 text-center">
                  <div className=" d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '100px', height: 'px' }}>
                    <img src="/logo.png" alt="GeoInsights Logo" width={100} height={100} className="mb-3" />
                  </div>
                  <h3 className="mb-3">Invalid Reset Link</h3>
                  <p className="text-muted mb-4">
                    This password reset link is invalid or has expired.
                  </p>
                  <Link 
                    href="/forgot-password" 
                    className="btn btn-primary w-100 mb-3"
                  >
                    Request New Reset Link
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className="text-decoration-none text-primary"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className=" d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '100px', height: 'px' }}>
                    <img src="/logo.png" alt="GeoInsights Logo" width={100} height={100} className="mb-3" />
                  </div>
                  <h2 className="card-title fw-bold mb-2">Set New Password</h2>
                  <p className="text-muted mb-0">
                    Create a new password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <div className="form-text">
                      Password must be at least 6 characters long.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <div className="text-center">
                    <Link href="/login" className="text-decoration-none text-primary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Login
                    </Link>
                  </div>
                </form>

                {message && (
                  <div className="alert alert-success mt-4" role="alert">
                    <div className="d-flex">
                      <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                      <div>
                        <strong className="d-block">{message}</strong>
                        <small className="d-block mt-1 text-success">
                          Redirecting to login page...
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger mt-4" role="alert">
                    <div className="d-flex">
                      <i className="fas fa-exclamation-triangle text-danger me-2 mt-1"></i>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}