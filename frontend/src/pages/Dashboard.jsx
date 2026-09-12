import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="auth-page">
      <h1>Welcome, {user?.name}</h1>
      <p>{user?.email}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
