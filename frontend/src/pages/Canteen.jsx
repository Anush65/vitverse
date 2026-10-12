import { useEffect, useState, useCallback } from "react";
import AppLayout from "../layouts/AppLayout";
import api from "../services/api";
import "./Canteen.css";

export default function Canteen() {
  const [canteens, setCanteens] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const fetchMyEntry = useCallback(async () => {
    const res = await api.get("/canteen/queues/me");
    setMyEntry(res.data);
  }, []);

  useEffect(() => {
    api.get("/canteen/canteens").then((res) => setCanteens(res.data));
    fetchMyEntry();

    const interval = setInterval(fetchMyEntry, 5000);
    return () => clearInterval(interval);
  }, [fetchMyEntry]);

  async function handleJoin(canteenId) {
    setError("");
    setJoiningId(canteenId);
    try {
      await api.post("/canteen/queues/join", { canteenId });
      await fetchMyEntry();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join queue");
    } finally {
      setJoiningId(null);
    }
  }

  async function handleLeave() {
    setError("");
    try {
      await api.delete(`/canteen/queues/${myEntry._id}`);
      setMyEntry(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave queue");
    }
  }

  return (
    <AppLayout>
      <h1>Canteen Queue</h1>
      <p>Join a virtual queue instead of standing in line.</p>

      {error && <p className="text-error" style={{ marginTop: "1rem" }}>{error}</p>}

      {myEntry ? (
        <div className="card queue-status">
          <h2>{myEntry.canteen.name}</h2>
          <p>{myEntry.canteen.location}</p>
          <div className="queue-stats">
            <div>
              <span className="queue-stat-value">#{myEntry.position}</span>
              <span className="queue-stat-label">your position</span>
            </div>
            <div>
              <span className="queue-stat-value">{myEntry.estimatedWaitMinutes}m</span>
              <span className="queue-stat-label">estimated wait</span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLeave}>
            Leave queue
          </button>
        </div>
      ) : (
        <div className="canteen-list">
          {canteens.map((canteen) => (
            <div key={canteen._id} className="card canteen-row">
              <div>
                <h2>{canteen.name}</h2>
                <p>{canteen.location}</p>
              </div>
              <button
                type="button"
                className="btn"
                disabled={!canteen.isOpen || joiningId === canteen._id}
                onClick={() => handleJoin(canteen._id)}
              >
                {canteen.isOpen ? "Join queue" : "Closed"}
              </button>
            </div>
          ))}
          {canteens.length === 0 && <p>No canteens available yet.</p>}
        </div>
      )}
    </AppLayout>
  );
}
