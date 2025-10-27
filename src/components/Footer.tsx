'use client';

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-5 border-top border-secondary">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5 className="text-decoration-none fw-bold fs-4 text-primary d-flex align-items-center gap-2"><img src="/logo.png" alt="GeoInsights Logo" width={50} height={50} />GeoInsights</h5>
            <p className="text-light small">
              GeoInsights is your platform for visualizing geospatial data and tracking vector borne diseases across the globe.
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="fw-semibold text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><Link href="/" className="text-light text-decoration-none">Home</Link></li>
              <li><Link href="/map" className="text-light text-decoration-none">Map Area</Link></li>
              <li><Link href="/datasets" className="text-light text-decoration-none">Upload Dataset</Link></li>
              <li><Link href="/about" className="text-light text-decoration-none">About Us</Link></li>
              <li><Link href="/contact" className="text-light text-decoration-none">Contact Us</Link></li>
              <li><Link href="/auth/login" className="text-light text-decoration-none">Login</Link></li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-semibold text-white mb-3">Connect with GeoInsights</h6>
            <div className="d-flex gap-3">
              <a href="https://twitter.com" className="text-light fs-5"><i className="fab fa-x-twitter"></i></a>
              <a href="https://ke.linkedin.com" className="text-light fs-5"><i className="fab fa-linkedin"></i></a>
              <a href="https://github.com" className="text-light fs-5"><i className="fab fa-github"></i></a>
              <a href="https://www.instagram.com" className="text-light fs-5"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="text-center text-light small">
          &copy; {new Date().getFullYear()} GeoInsights. Transform Location Data into Actionable Insights. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
