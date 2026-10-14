import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import AppLayout from "../layouts/AppLayout";
import "./Notices.css";

const emptyForm = {
  title: "",
  content: "",
  category: "General",
};

export default function AdminNotices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadNotices() {
    try {
      const response = await api.get("/notices");
      setNotices(response.data);
    } catch {
      setError("Unable to load notices.");
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, form);
        setMessage("Notice updated successfully!");
      } else {
        await api.post("/notices", form);
        setMessage("Notice created successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(notice) {
    setEditingId(notice._id);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/notices/${id}`);
      setMessage("Notice deleted successfully!");
      await loadNotices();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete notice.");
    }
  }
   if (user?.role !== "admin") {
    return <Navigate to="/notices" replace />;
  }

  return (
    <AppLayout>
      <div className="notices-page">
        <h1>Manage Announcements</h1>
        <p>Create, update, and delete campus notices.</p>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p className="notice-error">{error}</p>}

        <form className="notice-admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Notice" : "Create Notice"}</h2>

          <input
            name="title"
            placeholder="Announcement title"
            value={form.title}
            onChange={handleChange}
            maxLength={150}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Academic</option>
            <option>Events</option>
            <option>Placements</option>
            <option>General</option>
          </select>

          <textarea
            name="content"
            placeholder="Write your announcement..."
            value={form.content}
            onChange={handleChange}
            rows={6}
            required
          />

          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Saving..." : editingId ? "Update Notice" : "Publish Notice"}
          </button>

          {editingId && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <h2>Published Notices</h2>

        <div className="notices-grid">
          {notices.map((notice) => (
            <div className="notice-card" key={notice._id}>
              <span className="notice-category">{notice.category}</span>
              <h3>{notice.title}</h3>
              <p className="notice-preview">{notice.content}</p>

              <div className="notice-admin-actions">
                <button
                  className="btn"
                  onClick={() => handleEdit(notice)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleDelete(notice._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}