'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

type News = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  published: boolean;
};

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  // Fetch all news on mount
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("/api/news");
      setNewsList(res.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      alert("Failed to load news. Please try again later.");
    }
  };

  const createNews = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert("Please fill in all fields before publishing.");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending:", { title, content, author });
      const res = await axios.post(
        "/api/news",
        { title, content, author, published: true },
        {
          headers: {
            "Content-Type": "application/json", 
          },
        }
      );

      if (res.status === 201) {
        alert("News article published successfully!");
        setTitle("");
        setContent("");
        setAuthor("");
        fetchNews();
      }
    } catch (error: any) {
      console.error("Error creating news:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to create article.");
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await axios.delete(`/api/news/${id}`);
      alert("Article deleted successfully.");
      fetchNews();
    } catch (error) {
      console.error("Failed to delete article:", error);
      alert("Failed to delete article. Please try again.");
    }
  };

  // Edit functionality
  const startEditing = (news: News) => {
    setEditingId(news.id);
    setEditTitle(news.title);
    setEditContent(news.content);
    setEditAuthor(news.author);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditAuthor("");
  };

  const updateNews = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim()) {
      alert("Please fill in all fields before updating.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `/api/news/${id}`,
        { 
          title: editTitle, 
          content: editContent, 
          author: editAuthor 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("News article updated successfully!");
        cancelEditing();
        fetchNews();
      }
    } catch (error: any) {
      console.error("Error updating news:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to update article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-primary fw-bold">
        <i className="fa fa-newspaper me-2"></i> Manage News
      </h2>

      {/* Create News */}
      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <h5 className="card-title mb-3">Add New Article</h5>
          <input
            className="form-control mb-3"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-3"
            placeholder="Write Content..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            className="form-control mb-3"
            placeholder="Author Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button
            className="btn btn-success w-100"
            onClick={createNews}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Publishing...
              </>
            ) : (
              <>
                <i className="fa fa-plus me-2"></i> Publish News
              </>
            )}
          </button>
        </div>
      </div>

      {/* News List */}
      <h4 className="mb-3">All News</h4>
      {newsList.length === 0 ? (
        <p className="text-muted">No news articles available.</p>
      ) : (
        <div className="row">
          {newsList.map((news) => (
            <div key={news.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  {editingId === news.id ? (
                    // Edit Mode
                    <>
                      <input
                        className="form-control mb-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="form-control mb-2"
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <input
                        className="form-control mb-2"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                      />
                      <div className="d-flex gap-2 mt-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateNews(news.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="fa fa-save me-2"></i>
                          )}
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditing}
                          disabled={loading}
                        >
                          <i className="fa fa-times me-2"></i>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <h5 className="card-title text-body">{news.title}</h5>
                      <p className="card-text flex-grow-1">
                        {news.content.length > 120
                          ? `${news.content.slice(0, 120)}...`
                          : news.content}
                      </p>
                      <small className="text-muted">
                        <i className="fa fa-user me-1"></i> {news.author} |{" "}
                        <i className="fa fa-calendar me-1"></i>{" "}
                        {new Date(news.createdAt).toLocaleDateString()}
                      </small>
                      <div className="d-flex gap-2 mt-3 align-self-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => startEditing(news)}
                        >
                          <i className="fa fa-edit me-1"></i> Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteNews(news.id)}
                        >
                          <i className="fa fa-trash me-1"></i> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}