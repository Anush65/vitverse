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
    description: "Find your next favourite thing, or pass yours along.",
    accent: "marketplace",
    label: "Student-to-student",
  },
  {
    to: "/canteen",
    icon: "🍽️",
    title: "Canteen",
    description: "Get ahead of the rush. Your next meal is a few taps away.",
    accent: "canteen",
    label: "Order ahead",
  },
  {
    to: "/bus-booking",
    icon: "🚌",
    title: "Campus bus",
    description: "Plan the ride and save a seat before you head out.",
    accent: "bus",
    label: "Plan a ride",
  },
  {
    to: "/notices",
    icon: "📢",
    title: "Notices",
    description: "The campus updates worth knowing, all in one feed.",
    accent: "notices",
    label: "Stay in the loop",
  },
  {
    to: "/profile",
    icon: "👤",
    title: "Profile",
    description: "Make your student profile feel a little more like you.",
    accent: "profile",
    label: "Your space",
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
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/notices"),
      api.get("/listings"),
      api.get("/canteen/canteens"),
    ]).then(([notices, listings, canteens]) => {
      setStats({
        notices: notices.data.length,
        listings: listings.data.length,
        canteensOpen: canteens.data.filter((canteen) => canteen.isOpen).length,
      });
    }).catch(() => setStatsError(true));
  }, []);

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <AppLayout>
      <motion.section
        className="dashboard-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="dashboard-hero-copy">
          <p className="dashboard-date"><span className="dashboard-live-dot" />{today} <span>·</span> VIT Chennai</p>
          <p className="dashboard-eyebrow">YOUR CAMPUS, IN SYNC</p>
          <h1>{greeting()}, {firstName}<span className="dashboard-wave"> ✳</span></h1>
          <p className="dashboard-subtitle">
            One less group chat to check. Find what&apos;s happening, grab a bite, and make campus yours.
          </p>
          <Link to="/notices" className="dashboard-hero-link">
            See what&apos;s happening <span aria-hidden="true">↗</span>
          </Link>
          {statsError && <p className="dashboard-data-note">Campus activity is temporarily unavailable.</p>}
        </div>
        <div className="dashboard-hero-art" aria-label="Campus life is all connected" role="img">
          <div className="dashboard-orbit dashboard-orbit-one" />
          <div className="dashboard-orbit dashboard-orbit-two" />
          <div className="dashboard-campus-mark">V<span>.</span></div>
          <div className="dashboard-float-card dashboard-float-top">
            <span className="dashboard-float-icon">🍜</span>
            <span><strong>Lunch, sorted</strong><small>Skip the queue</small></span>
            <span className="dashboard-float-arrow">↗</span>
          </div>
          <div className="dashboard-float-card dashboard-float-bottom">
            <span className="dashboard-float-icon dashboard-float-icon-lime">✳</span>
            <span><strong>Campus is buzzing</strong><small>People, plans, possibilities</small></span>
          </div>
          <span className="dashboard-art-spark dashboard-art-spark-one">✳</span>
          <span className="dashboard-art-spark dashboard-art-spark-two">✦</span>
        </div>
      </motion.section>

      <section className="dashboard-section dashboard-pulse" aria-label="Campus pulse">
        <div className="dashboard-section-heading">
          <div>
            <p className="dashboard-section-kicker">A LITTLE CAMPUS PULSE</p>
            <h2>Today, at a glance</h2>
          </div>
          <span className="dashboard-pulse-caption">Your campus is always moving.</span>
        </div>
        <div className="dashboard-stats">
          <div className="dashboard-stat dashboard-stat-notices">
            <span className="dashboard-stat-icon">↗</span>
            <div><strong>{stats ? stats.notices : "—"}</strong><span>fresh notices</span></div>
          </div>
          <div className="dashboard-stat dashboard-stat-market">
            <span className="dashboard-stat-icon">◈</span>
            <div><strong>{stats ? stats.listings : "—"}</strong><span>things to discover</span></div>
          </div>
          <div className="dashboard-stat dashboard-stat-canteen">
            <span className="dashboard-stat-icon">●</span>
            <div><strong>{stats ? stats.canteensOpen : "—"}</strong><span>canteens open now</span></div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading dashboard-discover-heading">
          <div>
            <p className="dashboard-section-kicker">THE GOOD STUFF</p>
            <h2>Make today yours</h2>
          </div>
          <span className="dashboard-pulse-caption">Your whole campus, just a little closer.</span>
        </div>
        <motion.div className="feature-grid" variants={container} initial="hidden" animate="show">
          {FEATURES.map((feature, index) => (
            <motion.div key={feature.to} variants={item} whileHover={{ y: -5 }} whileTap={{ scale: 0.985 }}>
              <Link to={feature.to} className={`feature-card accent-${feature.accent}`}>
                <div className="feature-card-topline">
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-card-arrow" aria-hidden="true">↗</span>
                </div>
                <span className="feature-card-label">{feature.label}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-card-index">0{index + 1}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AppLayout>
  );
}
