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
  const initials = (user?.name || "V")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span className="navbar-brand-mark" aria-hidden="true">v</span>
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
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Change theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <Link to="/profile" className="navbar-user" aria-label={`Open ${user?.name || "student"}'s profile`}>
          <span className="navbar-user-avatar">{initials}</span>
          <span>{user?.name?.split(" ")[0]}</span>
        </Link>
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
