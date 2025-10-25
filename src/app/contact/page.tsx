'use client';
import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<{ type: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', text: data.error || 'Something went wrong' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h1 className="fw-bold text-heading mb-3">Contact Us</h1>
        <p className="text-body-secondary">
          We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
        </p>
      </section>

      <div className="row gy-4">
        <div className="col-md-6">
          <div className="rounded-4 shadow-sm p-4 bg-surface border h-100">
            <div className="text-center mb-4">
              <img
                src="/logo.png"
                alt="Logo"
                style={{ maxWidth: '120px' }}
              />
            </div>
            <h5 className="fw-semibold text-heading mb-3">Reach Us</h5>
            <p className="text-body-secondary mb-2">
              <i className="fas fa-envelope me-2 text-primary"></i> louisnderitu20@gmail.com
            </p>
            <p className="text-body-secondary mb-2">
              <i className="fas fa-phone me-2 text-primary"></i> +254 787 570 236
            </p>
            <p className="text-body-secondary mb-0">
              <i className="fas fa-map-marker-alt me-2 text-primary"></i> Nairobi, Kenya
            </p>
            <hr className="my-4" />
            <iframe
              title="Google Map"
              className="w-100 rounded shadow-sm"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63838.83335192321!2d36.74014845!3d-1.30316895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi!5e0!3m2!1sen!2ske!4v1718191010101"
            ></iframe>
          </div>
        </div>
        <div className="col-md-6">
          <form className="rounded-4 shadow-sm p-4 bg-surface border" onSubmit={handleSubmit}>
            <h5 className="fw-semibold text-heading mb-3">Send a Message</h5>

            {status && (
              <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>
                {status.text}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                className="form-control"
                id="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
