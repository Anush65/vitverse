import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import "./Profile.css";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    branch: user?.branch || "",
    year: user?.year || "",
    hostelBlock: user?.hostelBlock || "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/listings", { params: { seller: user?.id } }).catch(() => ({ data: [] })),
      api.get("/canteen/orders/mine").catch(() => ({ data: [] })),
    ]).then(([listings, orders]) => {
      setStats({ listings: listings.data.length, orders: orders.data.length });
    });
  }, [user?.id]);

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await api.put("/users/me", form);
      updateUser(res.data);
      setEditing(false);
      showToast("Profile updated!");
    } catch (err) {
      const message = err.response?.data?.message || "Update failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="profile-header card">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        {stats && (
          <div className="profile-stats">
            <div className="profile-stat-chip accent-marketplace">
              <strong>{stats.listings}</strong>
              <span>listings posted</span>
            </div>
            <div className="profile-stat-chip accent-canteen">
              <strong>{stats.orders}</strong>
              <span>canteen orders</span>
            </div>
          </div>
        )}

        <div className="card profile-details">
          {!editing ? (
            <>
              <div className="profile-details-grid">
                <div>
                  <span className="profile-field-label">Branch</span>
                  <strong>{user?.branch || "Not set"}</strong>
                </div>
                <div>
                  <span className="profile-field-label">Year</span>
                  <strong>{user?.year || "Not set"}</strong>
                </div>
                <div>
                  <span className="profile-field-label">Hostel Block</span>
                  <strong>{user?.hostelBlock || "Not set"}</strong>
                </div>
              </div>
              <div className="profile-bio">
                <span className="profile-field-label">Bio</span>
                <p>{user?.bio || "No bio added yet."}</p>
              </div>
              <button type="button" className="btn" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="profile-form">
              <label>
                Name
                <input className="input" name="name" value={form.name} onChange={updateForm} required />
              </label>
              <label>
                Bio
                <textarea
                  className="input"
                  name="bio"
                  value={form.bio}
                  onChange={updateForm}
                  maxLength={200}
                  placeholder="A short bio about yourself"
                />
              </label>
              <div className="profile-form-grid">
                <label>
                  Branch
                  <input
                    className="input"
                    name="branch"
                    value={form.branch}
                    onChange={updateForm}
                    placeholder="e.g. Computer Science"
                  />
                </label>
                <label>
                  Year
                  <select className="input" name="year" value={form.year} onChange={updateForm}>
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Hostel Block
                  <input
                    className="input"
                    name="hostelBlock"
                    value={form.hostelBlock}
                    onChange={updateForm}
                    placeholder="e.g. Men's Hostel C Block"
                  />
                </label>
              </div>
              {error && <p className="text-error">{error}</p>}
              <div className="profile-form-actions">
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user?.name || "",
                      bio: user?.bio || "",
                      branch: user?.branch || "",
                      year: user?.year || "",
                      hostelBlock: user?.hostelBlock || "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
