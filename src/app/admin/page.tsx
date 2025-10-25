'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin: string | null;
};

type News = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
};


export default function AdminDashboard() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    updateRole: false,
    toggleVerify: false,
    updateUser: false,
    deleteUser: false,
    userId: ""
  });

  // Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Security: Check if user is admin
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
 useEffect(() => {
  const checkAdmin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const res = await axios.get("/api/auth/me");

      if (res.data.role !== "admin") {
        setIsAuthorized(false);
        // Show "Unauthorized" message for 2 seconds before redirect
        setTimeout(() => {
          // Use replace instead of push to avoid full layout reload
          router.replace("/dashboard");
        }, 2000);
      } else {
        setIsAuthorized(true);
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthorized(false);
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  checkAdmin();
}, [router]);


  // Fetch users after auth check
  useEffect(() => {
    if (!authChecked) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        const res = await axios.get("/api/admin/users");
        const data = res.data;

        if (Array.isArray(data)) setUsers(data);
        else if (Array.isArray(data.users)) setUsers(data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [authChecked]);

  // Actions
  const updateRole = async (userId: string, newRole: string) => {
    setActionLoading({ ...actionLoading, updateRole: true, userId });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update role");
    } finally {
      setActionLoading({ ...actionLoading, updateRole: false, userId: "" });
    }
  };

  const toggleVerify = async (userId: string, currentStatus: boolean) => {
    setActionLoading({ ...actionLoading, toggleVerify: true, userId });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await axios.put(`/api/admin/users/${userId}/verify`, { verified: !currentStatus });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, verified: !currentStatus } : u))
      );
    } catch (err) {
      console.error("Failed to update verification status:", err);
      alert("Failed to update verification status");
    } finally {
      setActionLoading({ ...actionLoading, toggleVerify: false, userId: "" });
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitUpdateUser = async () => {
    if (!formData.name || !formData.email || !formData.username) {
      return alert("All fields are required.");
    }
    if (!editingUser) return;

    setActionLoading({ ...actionLoading, updateUser: true, userId: editingUser.id });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await axios.put(`/api/admin/users/${editingUser.id}/role`, {
        name: formData.name,
        email: formData.email,
        username: formData.username,
      });

      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? { ...u, name: formData.name, email: formData.email, username: formData.username }
            : u
        )
      );

      closeModal();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user");
    } finally {
      setActionLoading({ ...actionLoading, updateUser: false, userId: "" });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setActionLoading({ ...actionLoading, deleteUser: true, userId });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await axios.delete(`/api/admin/users/${userId}/role`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    } finally {
      setActionLoading({ ...actionLoading, deleteUser: false, userId: "" });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authChecked || isLoading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <div className="text-center">
          {isAuthorized === false ? (
            <>
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Unauthorized Access - Redirecting...
              </div>
              <div className="spinner-border text-danger mt-3" role="status">
                <span className="visually-hidden">Redirecting...</span>
              </div>
            </>
          ) : (
            <>
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5">Loading Admin Dashboard...</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="d-flex min-vh-100 bg-body text-body">
      {/* Sidebar */}
      <div
        className="p-4"
        style={{
          width: "289px",
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bs-body-bg)",
          color: "var(--bs-body-color)",
          borderRight: "1px solid var(--bs-border-color-translucent)",
        }}
      >
        <h4 className="mb-4">GeoInsights Admin Centre</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a className="nav-link text-reset" href="#dashboard-section">
              <i className="fas fa-home me-2"></i> Dashboard
            </a>
          </li>
          <li className="nav-item mb-2">
            <a className="nav-link text-reset" href="#users-section">
              <i className="fas fa-users me-2"></i> Users
            </a>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-reset" href="/admin/news">
              <i className="fas fa-newspaper me-2"></i> Manage News
            </Link>
          </li>
          <li className="nav-item">
            <a className="nav-link text-reset" href="#settings-section">
              <i className="fas fa-cog me-2"></i> Settings
            </a>
          </li>
        </ul>
        <div className="mt-auto pt-5">
          <small className="text-muted">© 2025 GEOINSIGHTS.</small>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-body text-body">
        {/* Header */}
        <div id="dashboard-section" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Welcome, Admin</h2>
              <p className="text-muted mb-0">Manage users, settings & permissions</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary me-2">Admin</span>
              <img src="/logo.png" alt="Logo" width={80} height={80} />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {[
            {
              icon: "fa-users",
              label: "Total Users",
              count: users.length,
              color: "primary",
            },
            {
              icon: "fa-user-check",
              label: "Active Users",
              count: users.filter((u) => u.lastLogin).length,
              color: "success",
            },
            {
              icon: "fa-hourglass-half",
              label: "Pending",
              count: users.filter((u) => !u.verified).length,
              color: "warning",
            },
            {
              icon: "fa-user-shield",
              label: "Admins",
              count: users.filter((u) => u.role === "admin").length,
              color: "info",
            },
          ].map((card, i) => (
            <div className="col-md-3" key={i}>
              <div className="card stat-card text-center shadow-sm">
                <div className="card-body">
                  <i className={`fas ${card.icon} fa-2x mb-2 text-${card.color}`}></i>
                  <h6>{card.label}</h6>
                  <h3>{card.count}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions & Search */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by email, username, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User Table */}
        <div id="users-section" className="table-responsive mb-5">
          <h4 className="mb-3">Users</h4>
          <table className="table table-bordered bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{user.username || "-"}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.verified ? (
                        <span className="badge bg-success">Verified</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => updateRole(user.id, "admin")}
                      >
                        <i className="fas fa-user-shield"></i> Make Admin
                      </button>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openEditModal(user)}
                      >
                        <i className="fas fa-edit"></i> Edit User
                      </button>
                      <button
                        className={`btn btn-sm me-2 ${
                          user.verified ? "btn-secondary" : "btn-success"
                        }`}
                        onClick={() => toggleVerify(user.id, user.verified)}
                      >
                        {user.verified ? (
                          <>
                            <i className="fas fa-times-circle"></i> Unverify
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle"></i> Verify
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteUser(user.id)}
                      >
                        <i className="fas fa-trash"></i> Delete User
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Settings Section */}
        <div id="settings-section" className="card mb-5">
          <div className="card-body">
            <h5 className="mb-3">Settings</h5>
            <p className="text-muted mb-0">
              Future content for administrative settings will go here.
            </p>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitUpdateUser();
                  }}
                >
                  <div className="mb-3">
                    <label htmlFor="nameInput" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      id="nameInput"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="emailInput" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="emailInput"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="usernameInput" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="usernameInput"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover Style */}
      <style jsx>{`
        .stat-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 15px rgba(255, 38, 4, 0.9);
          background-color: var(--bs-light);
        }
      `}</style>
    </div>
  );
}
