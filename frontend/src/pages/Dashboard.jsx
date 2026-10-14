import { Link } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const FEATURES = [
  {
    to: "/marketplace",
    icon: "🛒",
    title: "Marketplace",
    description: "Buy, sell, and rent items with fellow students.",
  },
  {
    to: "/canteen",
    icon: "🍽️",
    title: "Canteen Queue",
    description: "Join a virtual queue and skip the physical line.",
  },
  {
    to: "/bus-booking",
    icon: "🚌",
    title: "Bus Booking",
    description: "Reserve your seat for today's campus shuttle.",
  },
  {
    to: "/notices",
    icon: "📢",
    title: "Notices",
    description: "Campus announcements, academics, and events.",
  },
  {
    to: "/profile",
    icon: "👤",
    title: "Profile",
    description: "View and edit your student profile.",
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppLayout>
      <div className="dashboard-header">
        <p className="dashboard-eyebrow">VITVERSE</p>
        <h1>
          {greeting()}, {firstName} 👋
        </h1>
        <p className="dashboard-subtitle">
          Everything campus, in one place. Pick where you want to go.
        </p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((feature) => (
          <Link to={feature.to} key={feature.to} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
