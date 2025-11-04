'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-lock text-white fa-lg"></i>
                  </div>
                  <h2 className="card-title fw-bold text-dark mb-2">Reset Password</h2>
                  <p className="text-muted mb-0">
                    Enter your email to receive a reset link
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center">
                    <Link href="/login" className="text-decoration-none text-primary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Login
                    </Link>
                  </div>
                </form>

                {/* Success Message */}
                {message && (
                  <div className="alert alert-success mt-4" role="alert">
                    <div className="d-flex">
                      <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                      <div>
                        <strong className="d-block">{message}</strong>
                        <small className="d-block mt-1 text-success">
                          Please check your email for the reset link.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger mt-4" role="alert">
                    <div className="d-flex">
                      <i className="fas fa-exclamation-triangle text-danger me-2 mt-1"></i>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Help Text */}
                <div className="mt-4 pt-3 border-top">
                  <div className="text-center">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Check your spam folder if you don't see the email.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}