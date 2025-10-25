'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h1 className="fw-bold mb-3 text-heading">About GeoInsights</h1>
        <p className="lead text-body-secondary mx-auto" style={{ maxWidth: '720px' }}>
          Empowering decision makers with geospatial intelligence for vector borne disease surveillance across Africa and beyond.
        </p>
      </section>

      <section className="row mb-5 gy-4">
        <div className="col-md-6">
          <div className="p-4 bg-surface border rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold text-heading mb-3"><i className="fas fa-bullseye text-primary me-2"></i>Our Mission</h4>
            <p className="text-body-secondary mb-0">
              To provide accurate, real time geospatial insights that support public health, drive intervention strategies and empower local researchers and institutions.
            </p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-4 bg-surface border rounded-4 shadow-sm h-100">
            <h4 className="fw-semibold text-heading mb-3"><i className="fas fa-eye text-primary me-2"></i>Our Vision</h4>
            <p className="text-body-secondary mb-0">
              A healthier world where data drives action where diseases are tracked, analyzed and mitigated before they become epidemics.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h3 className="fw-semibold mb-4 text-center text-heading">Our Core Values</h3>
        <div className="row text-center gy-4">
          {[
            ["Innovation", "fa-lightbulb", "We continuously seek new ways to visualize, analyze and interpret geospatial data."],
            ["Collaboration", "fa-users", "We believe in partnerships with researchers, governments and NGOs."],
            ["Transparency", "fa-unlock-alt", "Open source driven and data you can trust."],
            ["Impact", "fa-globe-africa", "We focus on real world results that produce excellent output."],
          ].map(([title, icon, desc], idx) => (
            <div className="col-md-3 col-6" key={idx}>
              <div className="p-4 bg-surface border rounded-4 shadow-sm h-100">
                <div className="fs-3 text-primary mb-3"><i className={`fas ${icon}`}></i></div>
                <h6 className="fw-semibold mb-2 text-heading">{title}</h6>
                <p className="small text-body-secondary mb-0">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="fw-semibold mb-4 text-center text-heading">Meet the Team</h3>
        <div className="row text-center gy-4">
          {[
            ["Louis Nderitu", "Software Developer", "/images/team/louis.png"],
            ["Ann Wanjiru", "Data Analyst", "/images/team/ann.png"],
            ["Dr. Ephraim", "Geospatial Engineer", "/images/team/ephraim.png"],
          ].map(([name, role, img], idx) => (
            <div className="col-md-4" key={idx}>
              <div className="p-4 bg-surface border rounded-4 shadow-sm h-100">
                <img
                  src={img}
                  alt={name}
                  className="rounded-circle mb-3"
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                />
                <h6 className="fw-semibold mb-1 text-heading">{name}</h6>
                <p className="small text-body-secondary mb-0">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
