import { useEffect, useState } from "react";
import api from "../services/api";
import AppLayout from "../layouts/AppLayout";
import "./Notices.css";

const categories = ["All", "Academic", "Events", "Placements", "General"];

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotices() {
      try {
        const response = await api.get("/notices");
        setNotices(response.data);
      } catch (err) {
        setError("Unable to load announcements.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || notice.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="notices-page">
        <div className="notices-heading">
          <h1>Notices & Announcements</h1>
          <p>Stay updated with the latest campus announcements.</p>
        </div>

        <div className="notices-filters">
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading announcements...</p>}
        {error && <p className="notice-error">{error}</p>}

        {!loading && !error && filteredNotices.length === 0 && (
          <div className="notices-empty">
            <h3>No announcements found</h3>
            <p>Try another search or category.</p>
          </div>
        )}

        <div className="notices-grid">
          {filteredNotices.map((notice) => (
            <div className="notice-card" key={notice._id}>
              <div className="notice-card-top">
                <span className="notice-category">{notice.category}</span>
                <span className="notice-date">
                  {new Date(notice.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              <h3>{notice.title}</h3>

              <p className="notice-preview">
                {notice.content.length > 140
                  ? notice.content.substring(0, 140) + "..."
                  : notice.content}
              </p>

              <button
                className="notice-read-btn"
                onClick={() => setSelectedNotice(notice)}
              >
                Read More →
              </button>
            </div>
          ))}
        </div>

        {selectedNotice && (
          <div
            className="notice-modal-overlay"
            onClick={() => setSelectedNotice(null)}
          >
            <div
              className="notice-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="notice-close"
                aria-label="Close notice"
                onClick={() => setSelectedNotice(null)}
              >
                ×
              </button>

              <span className="notice-category">
                {selectedNotice.category}
              </span>

              <h2 id="notice-modal-title">{selectedNotice.title}</h2>

              <p className="notice-date">
                {new Date(selectedNotice.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>

              <p className="notice-full-content">
                {selectedNotice.content}
              </p>

              <p className="notice-author">
                Posted by: {selectedNotice.createdBy?.name || "Admin"}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}