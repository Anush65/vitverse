import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.put("/users/me", { name });
      updateUser(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  }

  return (
    <AppLayout>
      <h1>Profile</h1>
      <div className="card" style={{ maxWidth: 420, marginTop: "1.5rem" }}>
        {!editing ? (
          <>
            <p style={{ marginBottom: "0.75rem" }}>
              <strong>Name:</strong> {user?.name}
            </p>
            <p style={{ marginBottom: "1.25rem" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            {saved && <p className="text-success">Profile updated!</p>}
            <button type="button" className="btn" onClick={() => setEditing(true)}>
              Edit name
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {error && <p className="text-error">{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setName(user?.name || "");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
