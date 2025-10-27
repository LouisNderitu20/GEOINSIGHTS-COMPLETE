'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('../../components/MapDisplay'), {
  ssr: false,
  loading: () => <p className="text-center text-muted">Loading map...</p>,
});

export default function HomePage() {
  return (
    <main className="container-fluid py-5">
      <section className="row align-items-center py-5 bg-primary-gradient text-white rounded-4 shadow-lg mb-5">
        <div className="col-md-6 text-center text-md-start">
          <h1 className="display-4 fw-bold mb-3">GeoInsights</h1>
          <p className="lead mb-4 opacity-75">
            A modern geospatial platform for exploring, filtering and exporting vector borne disease data with interactive maps.
          </p>
          <div className="d-flex gap-3 justify-content-center justify-content-md-start">
            <a href="/map" className="btn btn-light btn-lg px-4 shadow-sm">Explore Map</a>
            <a href="/contact" className="btn btn-outline-light btn-lg px-4">Get in Touch</a>
          </div>
        </div>
        <div className="col-md-6 text-center mt-4 mt-md-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
            alt="Map visual"
            className="img-fluid rounded shadow"
            style={{ maxHeight: "320px", objectFit: "cover" }}
          />
        </div>
      </section>

      <section className="py-5">
        <div className="row text-center gy-4">
          {[
            ["57+", "Regions Monitored"],
            ["10+", "Sample Records"],
            ["23", "Succesful exports"],
          ].map(([value, label], idx) => (
            <div className="col-12 col-md-4" key={idx}>
              <div className="p-4 border rounded-4 shadow-sm h-100 bg-surface">
                <h3 className="fw-bold text-primary mb-1">{value}</h3>
                <p className="text-body-secondary mb-0">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5">
        <h2 className="text-center fw-semibold mb-5 text-heading">Platform Highlights</h2>
        <div className="row text-center gy-4">
          {[
            {
              title: "Interactive Maps",
              desc: "Cluster markers, vector layers and filtering for spatial insights.",
              icon: "fa-map-marked-alt"
            },
            {
              title: "Smart Filtering",
              desc: "Filter by region, species, year and exact location by using the search bar. Instantly responsive.",
              icon: "fa-filter"
            },
            {
              title: "Dataset Upload",
              desc: "Upload CSV files with geographic data for easy storage as you use the system.",
              icon: "fa-upload"
            },
            {
              title: "Seamless Exports",
              desc: "Export to CSV or GeoJSON in one click.",
              icon: "fa-file-export"
            },
          ].map((feature, idx) => (
            <div className="col-md-3" key={idx}>
              <div className="rounded-4 p-4 h-100 border shadow-sm feature-card bg-surface">
                <div className="mb-3 fs-2 text-primary">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h5 className="fw-semibold mb-2 text-heading">{feature.title}</h5>
                <p className="text-body-secondary mb-0">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5 text-center">
        <h3 className="fw-semibold mb-2 text-heading">Explore the Map</h3>
        <p className="text-body-secondary mb-4">View regional data in real time</p>
        <div className="rounded overflow-hidden shadow-sm mb-4" style={{ maxWidth: "100%", height: "500px" }}>
          <MapDisplay />
        </div>
        <a href="/map" className="btn btn-outline-primary btn-lg">Launch Full Map View</a>
      </section>

      <section className="py-5">
        <h3 className="text-center fw-semibold mb-5 text-heading">Data Highlights</h3>
        <div className="row text-center gy-4">
          {[
            ["142", "Vector Species Tracked"],
            ["298", "Surveillance Sites"],
            ["500", "Reported Incidents"],
            ["17", "Countries Covered"],
          ].map(([value, label], idx) => (
            <div className="col-md-3 col-6" key={idx}>
              <div className="p-4 rounded-4 shadow-sm h-100 border highlight-card bg-surface">
                <h4 className="fw-bold text-primary mb-1">{value}</h4>
                <p className="small mb-0 text-body-secondary">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5 border-top bg-secondary-subtle">
        <h3 className="text-center fw-semibold mb-5 text-heading">What People Say</h3>
        <div className="row gy-4">
          {[
            {
              quote: "GeoInsights helped us identify and see intervention hotspots faster than ever before.",
              author: "Allan W, Field Researcher",
            },
            {
              quote: "The site saves hours of searching each point to see the actual site. Incredible tool. Easy way to see areas without struggles",
              author: "Ephraim K, Geospatial Researcher.",
            },
          ].map((testimonial, idx) => (
            <div className="col-md-6" key={idx}>
              <div className="p-4 rounded-4 shadow-sm border h-100 bg-surface">
                <p className="mb-3 text-body-secondary">“{testimonial.quote}”</p>
                <p className="fw-semibold text-primary mb-0">— {testimonial.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center py-5 border-top">
        <h4 className="fw-semibold mb-3 text-heading">
          Open platform. Research-ready. Built for impact.
        </h4>
        <p className="mb-4 text-body-secondary">
          Join researchers, analysts and NGOs using GeoInsights to strengthen disease surveillance.
        </p>
        <a href="/auth/register" className="btn btn-dark btn-lg px-4 shadow-sm">Create an Account</a>
      </section>
    </main>
  )
}
