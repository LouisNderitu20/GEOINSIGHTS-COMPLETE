'use client'

import React, { useRef, useState, useEffect } from 'react';
interface UserFile {
  id: string
  name: string
  fileName: string
  fileSize: number
  createdAt: string
}

export default function DatasetsPage() {
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchUserFiles()
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem('token')) {
        setFiles([]);
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    
    if (!localStorage.getItem('token')) {
      setFiles([]);
      setLoading(false);
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchUserFiles = async () => {
    try {
      
      if (!localStorage.getItem('token')) {
        setFiles([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/datasets')
      
      
      if (response.status === 401) {
        setFiles([]);
        localStorage.removeItem('token');
        return;
      }
      
      const data = await response.json()
      if (data.success) setFiles(data.files)
    } catch (err) {
      console.error('Error:', err)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    
    if (!localStorage.getItem('token')) {
      alert('Please log in to upload files');
      return;
    }

    setUploading(true)

    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget
    
    try {
      const response = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        fetchUserFiles() 
        if (form) {
          form.reset()
        }
        alert('File uploaded successfully!')
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      fetchUserFiles()
      alert('Upload may have completed. Refreshing file list...')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      
      if (!localStorage.getItem('token')) {
        alert('Please log in to download files');
        return;
      }

      const response = await fetch(`/api/user/datasets/${fileId}/download`)
      
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        setFiles([]);
        localStorage.removeItem('token');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      
     
      document.body.appendChild(a)
      a.click()
      
    
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      console.error('Download error:', err)
      alert('Download failed')
    }
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return

    
    if (!localStorage.getItem('token')) {
      alert('Please log in to delete files');
      return;
    }

    try {
      const response = await fetch(`/api/user/datasets/${fileId}`, { method: 'DELETE' })
      
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        setFiles([]);
        localStorage.removeItem('token');
        return;
      }

      const data = await response.json()
      
      if (data.success) {
        setFiles(files.filter(file => file.id !== fileId))
        alert('File deleted')
      } else {
        alert(data.error || 'Delete failed')
      }
    } catch (err) {
      alert('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100  d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your datasets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-7 fw-bold mb-3">My Datasets</h1>
          <p className="lead text-muted">Manage your geographic datasets.</p>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h4 card-title fw-semibold mb-4">Upload New Dataset</h2>
                
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      CSV File
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept=".csv"
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      Dataset Name (optional)
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="My Dataset"
                      className="form-control"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn btn-primary w-100 py-2"
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Dataset'
                    )}
                  </button>
                </form>

                <div className="mt-4 p-3 ">
                  <h3 className="h6 fw-medium  mb-2">CSV Format Required:</h3>
                  <code className="d-block p-2  border rounded">
                    lat,lng,label,type,species,year
                  </code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h4 card-title fw-semibold mb-4">
                  Your Files: <span>{files.length}</span>
                </h2>
                
                {files.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <div className="fs-1 mb-3"></div>
                    <p>No datasets uploaded yet</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {files.map((file) => (
                      <div key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <h3 className="h6 fw-medium  mb-1">{file.name}</h3>
                          <p className="text-muted small mb-0">
                            {file.fileName} • {file.fileSize} bytes • {new Date(file.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <div className="btn-group ms-3">
                          <button 
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Download
                          </button>
                          <button 
                            onClick={() => handleDelete(file.id, file.name)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}