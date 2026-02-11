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

type UserWithStats = User & {
  fileCount: number;
  totalStorage: number;
  lastUpload: string | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [usersWithStats, setUsersWithStats] = useState<UserWithStats[]>([]);
  const [actionLoading, setActionLoading] = useState({
    updateRole: false,
    toggleVerify: false,
    updateUser: false,
    deleteUser: false,
    userId: ""
  });


  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", username: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const res = await axios.get("/api/auth/me");

        if (res.data.role !== "admin") {
          setIsAuthorized(false);
          setTimeout(() => router.replace("/dashboard"), 1000);
        } else {
          setIsAuthorized(true);
          setAuthChecked(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthorized(false);
        setTimeout(() => router.replace("/"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const [usersRes, statsRes] = await Promise.all([
          axios.get("/api/admin/users"),
          axios.get("/api/admin/user-stats")
        ]);

        const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users;
        setUsers(usersData);
        
        if (statsRes.data.success) {
          setUsersWithStats(statsRes.data.users);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authChecked]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-GB'): 'Never';
  };

  const handleApiAction = async (action: () => Promise<void>, type: keyof typeof actionLoading, userId: string) => {
    setActionLoading(prev => ({ ...prev, [type]: true, userId }));
    try {
      await action();
    } catch (err) {
      console.error(`Failed to ${type}:`, err);
      alert(`Failed to ${type}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [type]: false, userId: "" }));
    }
  };

  const updateRole = (userId: string, newRole: string) => 
    handleApiAction(async () => {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }, "updateRole", userId);

  const toggleVerify = (userId: string, currentStatus: boolean) =>
    handleApiAction(async () => {
      await axios.put(`/api/admin/users/${userId}/verify`, { verified: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentStatus } : u));
    }, "toggleVerify", userId);

  const deleteUser = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    handleApiAction(async () => {
      await axios.delete(`/api/admin/users/${userId}/role`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }, "deleteUser", userId);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name || "", email: user.email || "", username: user.username || "" });
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
    if (!formData.name || !formData.email || !formData.username || !editingUser) {
      return alert("All fields are required.");
    }

    await handleApiAction(async () => {
      await axios.put(`/api/admin/users/${editingUser.id}/role`, formData);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      closeModal();
    }, "updateUser", editingUser.id);
  };

  const stats = [
    { icon: "fa-users", label: "Total Users", count: users.length, color: "primary" },
    { icon: "fa-user-check", label: "Active Users", count: users.filter((u) => u.lastLogin).length, color: "success" },
    { icon: "fa-hourglass-half", label: "Pending", count: users.filter((u) => !u.verified).length, color: "warning" },
    { icon: "fa-user-shield", label: "Admins", count: users.filter((u) => u.role === "admin").length, color: "info" },
    { icon: "fa-file-csv", label: "Total Files", count: usersWithStats.reduce((sum, user) => sum + user.fileCount, 0), color: "secondary" },
    { icon: "fa-database", label: "Storage Used", count: formatFileSize(usersWithStats.reduce((sum, user) => sum + user.totalStorage, 0)), color: "dark" }
  ];

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
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
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
      <div className="p-4" style={{
        width: "289px",
        height: "100vh",
        position: "sticky",
        top: 0,
        backgroundColor: "var(--bs-body-bg)",
        color: "var(--bs-body-color)",
        borderRight: "1px solid var(--bs-border-color-translucent)",
      }}>
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
        </ul>
        <div className="mt-auto pt-5">
          <small className="text-muted">&copy; {new Date().getFullYear()} GEOINSIGHTS.</small>
        </div>
      </div>

      <div className="flex-grow-1 p-4 bg-body text-body">
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

        <div className="row g-3 mb-4">
          {stats.map((card, i) => (
            <div className="col-md-4" key={i}>
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

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="input-group" style={{ maxWidth: "500px" }}>
            <span className="input-group-text"><i className="fas fa-search"></i></span>
            <input type="text" className="form-control" placeholder="Search by email, username, or name..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>{user.username || "-"}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge ${user.verified ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                     <div className="d-flex flex-wrap gap-1">
                    <button
                      className={`btn btn-sm ${user.role === "admin" ? "btn-success" : "btn-warning"} me-1`}
                      style={{ width: "80px" }}
                      onClick={() =>
                        updateRole(user.id, user.role === "admin" ? "user" : "admin")
                      }
                    >
                      <i className={`fas ${user.role === "admin" ? "fa-user" : "fa-user-shield"}`}></i>{" "}
                      {user.role === "admin" ? " Make User" : " Make Admin"}
                    </button>
                    <button className="btn btn-sm btn-primary me-2" 
                    style={{ width: "80px" }}
                    onClick={() => openEditModal(user)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button className={`btn btn-sm me-1 ${user.verified ? "btn-secondary" : "btn-success"}`}
                      style={{ width: "80px" }}
                      onClick={() => toggleVerify(user.id, user.verified)}>
                      <i className={`fas ${user.verified ? "fa-times-circle" : "fa-check-circle"}`}></i>
                      {user.verified ? " Unverify" : " Verify"}
                    </button>
                    <button className="btn btn-sm btn-danger" 
                    style={{ width: "80px" }}
                    onClick={() => deleteUser(user.id)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card mb-5">
          <div className="card-body">
            <h4 className="mb-3">User File Uploads</h4>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Files Uploaded</th>
                    <th>Total Storage</th>
                    <th>Last Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithStats.filter(user => user.fileCount > 0).map((user) => (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong><br /><small className="text-muted">@{user.username}</small></td>
                      <td>{user.email}</td>
                      <td>{user.fileCount}</td>
                      <td>{formatFileSize(user.totalStorage)}</td>
                      <td>{formatDate(user.lastUpload)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); submitUpdateUser(); }}>
                    {['name', 'email', 'username'].map((field) => (
                      <div className="mb-3" key={field}>
                        <label className="form-label text-capitalize">{field}</label>
                        <input 
                          type={field === 'email' ? 'email' : 'text'} 
                          name={field} 
                          className="form-control"
                          value={formData[field as keyof typeof formData]} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    ))}
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .stat-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
          .stat-card:hover { transform: translateY(-5px); box-shadow: 0 0 15px rgba(255, 38, 4, 0.9); }
        `}</style>
      </div>
    </div>
  );
}