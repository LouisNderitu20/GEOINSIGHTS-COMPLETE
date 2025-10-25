'use client';

import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type DecodedToken = {
  id: string;
  email: string;
  username: string;
  role: string;
  exp: number;
};

export default function Navbar() {
  const { toggleTheme, theme } = useTheme();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          setUsername(decoded.username);
        } catch (err) {
          console.error('Invalid token');
          localStorage.removeItem('token');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 2000,
      onClose: () => (window.location.href = '/dashboard'),
    });
  };

  const linkClass = 'text-primary text-decoration-none fw-medium';

  return (
    <>
      <nav
        className={`d-flex justify-content-between align-items-center px-4 py-3 border-bottom ${
          theme === 'dark' ? 'bg-dark text-light' : 'bg-white'
        }`}
      >
        <Link
          href="/"
          className="text-decoration-none fw-bold fs-4 text-primary d-flex align-items-center gap-2"
        >
          <img src="/logo.png" alt="GeoInsights Logo" width={50} height={50} />
          GeoInsights
        </Link>

        <div className="d-flex align-items-center gap-4">
          <Link href="/dashboard" className={linkClass}>
            Home
          </Link>
          <Link href="/map" className={linkClass}>
            Map Area
          </Link>
          <Link href="/about" className={linkClass}>
            About Us
          </Link>
          <Link href="/news" className={linkClass}>
            News
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact Us
          </Link>

          {username ? (
            <>
              <span className="text-primary fw-bold">Hello, {username}</span>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline-danger"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className={linkClass}>
              Login
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="btn btn-sm rounded-circle border-0 bg-transparent text-primary"
            aria-label="Toggle Theme"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>
      </nav>

      <ToastContainer />
    </>
  );
}
