import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

const LINKS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/notices", icon: "📢", label: "Notices" },
  { to: "/marketplace", icon: "🛒", label: "Marketplace" },
  { to: "/canteen", icon: "🍽️", label: "Canteen" },
  { to: "/bus-booking", icon: "🚌", label: "Bus" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span className="navbar-brand-dot" />
        VITVerse
      </Link>
      <div className="navbar-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-actions">
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <span className="navbar-user">{user?.name}</span>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
