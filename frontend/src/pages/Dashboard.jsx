import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

const FEATURES = [
  {
    to: "/marketplace",
    icon: "🛒",
    title: "Marketplace",
    description: "Buy, sell, and rent items with fellow students.",
    accent: "marketplace",
  },
  {
    to: "/canteen",
    icon: "🍽️",
    title: "Canteen",
    description: "Order food ahead, or join a virtual queue.",
    accent: "canteen",
  },
  {
    to: "/bus-booking",
    icon: "🚌",
    title: "Bus Booking",
    description: "Reserve your seat for today's campus shuttle.",
    accent: "bus",
  },
  {
    to: "/notices",
    icon: "📢",
    title: "Notices",
    description: "Campus announcements, academics, and events.",
    accent: "notices",
  },
  {
    to: "/profile",
    icon: "👤",
    title: "Profile",
    description: "View and edit your student profile.",
    accent: "profile",
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/notices").catch(() => ({ data: [] })),
      api.get("/listings").catch(() => ({ data: [] })),
      api.get("/canteen/canteens").catch(() => ({ data: [] })),
    ]).then(([notices, listings, canteens]) => {
      setStats({
        notices: notices.data.length,
        listings: listings.data.length,
        canteensOpen: canteens.data.filter((c) => c.isOpen).length,
      });
    });
  }, []);

  return (
    <AppLayout>
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="dashboard-eyebrow">VITVERSE</p>
        <h1>
          {greeting()}, {firstName} 👋
        </h1>
        <p className="dashboard-subtitle">
          Everything campus, in one place. Pick where you want to go.
        </p>
        {stats && (
          <div className="dashboard-stats">
            <span>📢 {stats.notices} notices</span>
            <span>🛒 {stats.listings} items for sale</span>
            <span>🍽️ {stats.canteensOpen} canteens open now</span>
          </div>
        )}
      </motion.div>

      <motion.div className="feature-grid" variants={container} initial="hidden" animate="show">
        {FEATURES.map((feature) => (
          <motion.div key={feature.to} variants={item} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link to={feature.to} className={`feature-card accent-${feature.accent}`}>
              <span className="feature-icon">{feature.icon}</span>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </AppLayout>
  );
}
