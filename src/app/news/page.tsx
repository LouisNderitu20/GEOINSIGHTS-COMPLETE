'use client';

import { useEffect, useState } from "react";
import axios from "axios";

type News = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
};

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("/api/news?published=true");
        setNewsList(res.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Function to format content with proper paragraphs
  const formatContent = (content: string, isExpanded: boolean, maxLength: number = 150) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n').filter(para => para.trim() !== '');
    
    if (!isExpanded && content.length > maxLength) {
      // Show preview with first paragraph truncated
      const firstParagraph = paragraphs[0];
      const preview = firstParagraph.length > maxLength 
        ? firstParagraph.slice(0, maxLength) + '...' 
        : firstParagraph;
      return <p className="card-text">{preview}</p>;
    }

    // Show full content with proper paragraphs
    return (
      <div className="card-text">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={index > 0 ? 'mt-3' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading latest news...</p>
        </div>
      </div>
    );
  }

  if (newsList.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No News Available</h4>
          <p className="text-muted">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Header Section */}
      <div className="text mb-4">
        <h2 className="fw-bold text-primary mb-2">
        Latest News
        </h2>
       <p className="text-muted mb-0 small">
           Stay informed with recent updates
      </p>
      </div>
      {/* News Grid */}
      <div className="row g-4">
        {newsList.map((news) => {
          const isExpanded = expanded === news.id;
          const shouldTruncate = news.content.length > 150 || news.content.includes('\n');

          return (
            <div key={news.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="card news-card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body d-flex flex-column">
                  {/* News Title */}
                  <h5 className="card-title text-primary fw-bold mb-3">
                    {news.title}
                  </h5>

                  {/* News Content */}
                  {formatContent(news.content, isExpanded)}

                  {/* Read More/Less Button */}
                  {shouldTruncate && (
                    <button
                      className="btn btn-link p-0 mt-2 text-decoration-none align-self-start"
                      onClick={() => setExpanded(isExpanded ? null : news.id)}
                    >
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} me-1`}></i>
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}

                  {/* Author and Date */}
                  <div className="mt-auto pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="fas fa-user me-1"></i>
                        {news.author}
                      </small>
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {new Date(news.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .news-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .news-card:hover {
          transform: translateY(-2px);
        }
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .card-text p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .card-text p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}