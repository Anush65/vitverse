import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import "./Profile.css";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const PROFILE_FIELDS = ["name", "email", "branch", "year", "hostelBlock", "bio"];

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

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await api.put("/users/me", form);
      updateUser(response.data);
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
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const completion = Math.round(
    (PROFILE_FIELDS.filter((field) => String(user?.[field] || "").trim()).length / PROFILE_FIELDS.length) * 100
  );

  return (
    <AppLayout>
      <motion.div
        className="profile-page"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-cover">
          <div className="profile-cover-lines" />
          <div className="profile-cover-copy">
            <p className="profile-eyebrow">YOUR CAMPUS IDENTITY</p>
            <h1>A little more you.</h1>
            <p>Your profile makes it easier to connect with your campus community.</p>
          </div>
          <span className="profile-cover-spark">✳</span>
          <span className="profile-cover-orb" />
        </div>

        <section className="profile-identity-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-identity">
            <div className="profile-name-row">
              <h2>{user?.name || "Student"}</h2>
              <span className="profile-student-badge"><span /> VIT student</span>
            </div>
            <p>{user?.email}</p>
            <div className="profile-identity-meta">
              {user?.branch && <span>{user.branch}</span>}
              {user?.year && <span>{user.year}</span>}
              {!user?.branch && !user?.year && <span>Campus community member</span>}
            </div>
          </div>
          <button type="button" className="btn profile-edit-button" onClick={() => setEditing(!editing)}>
            {editing ? "Close editor" : "Edit profile"} <span aria-hidden="true">{editing ? "×" : "↗"}</span>
          </button>
        </section>

        <div className="profile-content-grid">
          <section className="card profile-details">
            <div className="profile-panel-heading">
              <div>
                <p className="profile-panel-kicker">THE INTRO</p>
                <h2>About you</h2>
              </div>
              {!editing && <span className="profile-panel-index">01</span>}
            </div>
            {!editing ? (
              <>
                <div className="profile-bio">
                  <p>{user?.bio || "Your story starts here. Add a short intro so other students can get to know you."}</p>
                </div>
                <div className="profile-details-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-icon">⌘</span>
                    <div><span className="profile-field-label">School / branch</span><strong>{user?.branch || "Add your branch"}</strong></div>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-icon">✳</span>
                    <div><span className="profile-field-label">Year of study</span><strong>{user?.year || "Add your year"}</strong></div>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-icon">⌂</span>
                    <div><span className="profile-field-label">Campus home</span><strong>{user?.hostelBlock || "Add your hostel block"}</strong></div>
                  </div>
                </div>
                <button type="button" className="profile-inline-edit" onClick={() => setEditing(true)}>
                  Add a little more about yourself <span aria-hidden="true">→</span>
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
                      {YEAR_OPTIONS.map((year) => <option key={year}>{year}</option>)}
                    </select>
                  </label>
                  <label>
                    Hostel block
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
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false);
                      setError("");
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
          </section>

          <aside className="profile-side-column">
            <section className="card profile-completion-card">
              <div className="profile-panel-heading">
                <div>
                  <p className="profile-panel-kicker">MAKE IT YOURS</p>
                  <h2>Profile check-in</h2>
                </div>
                <span className="profile-completion-number">{completion}%</span>
              </div>
              <div className="profile-progress-track" role="progressbar" aria-label="Profile completeness" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100">
                <span style={{ width: `${completion}%` }} />
              </div>
              <p>{completion === 100 ? "Looking good — your campus profile is complete." : "A few details help your campus community get to know you."}</p>
              <button type="button" className="profile-inline-edit" onClick={() => setEditing(true)}>
                {completion === 100 ? "Review your profile" : "Finish your profile"} <span aria-hidden="true">→</span>
              </button>
            </section>

            <section className="card profile-activity-card">
              <p className="profile-panel-kicker">YOUR VITVERSE FOOTPRINT</p>
              <h2>Little things add up.</h2>
              {stats ? (
                <div className="profile-stats">
                  <div className="profile-stat-chip accent-marketplace">
                    <span className="profile-stat-symbol">◈</span>
                    <div><strong>{stats.listings}</strong><span>listings shared</span></div>
                  </div>
                  <div className="profile-stat-chip accent-canteen">
                    <span className="profile-stat-symbol">✳</span>
                    <div><strong>{stats.orders}</strong><span>canteen orders</span></div>
                  </div>
                </div>
              ) : (
                <p className="profile-loading">Your activity is on its way…</p>
              )}
              <span className="profile-activity-note">Thanks for making campus life more connected.</span>
            </section>
          </aside>
        </div>
      </motion.div>
    </AppLayout>
  );
}
