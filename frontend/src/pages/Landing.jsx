import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

const FEATURES = [
  { icon: "🛒", title: "Marketplace", desc: "Buy, sell, and rent with fellow students — textbooks, gadgets, cycles, and more.", accent: "marketplace" },
  { icon: "🍽️", title: "Canteen Ordering", desc: "Order ahead from Gymkhana or Domino's and skip the line, or join a live queue.", accent: "canteen" },
  { icon: "🚌", title: "Bus Booking", desc: "Reserve your seat on the campus shuttle with a live seat map.", accent: "bus" },
  { icon: "📢", title: "Notices", desc: "Fests, placement drives, and deadlines — all in one feed, never missed.", accent: "notices" },
  { icon: "👤", title: "Verified Profiles", desc: "Every account is a real VIT student — email-verified, no randoms.", accent: "profile" },
];

const STATS = [
  { value: "5", label: "campus modules" },
  { value: "20+", label: "marketplace listings" },
  { value: "2", label: "canteens to order from" },
  { value: "16", label: "live campus notices" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="navbar-brand-dot" />
          VITVerse
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-secondary">
            Login
          </Link>
          <Link to="/register" className="btn">
            Get Started
          </Link>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <motion.div
          className="landing-hero-content"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.span className="landing-pill" variants={fadeUp}>
            🎓 Built by VIT students, for VIT students
          </motion.span>
          <motion.h1 variants={fadeUp}>
            Your entire campus life, <span className="landing-gradient-text">in one app.</span>
          </motion.h1>
          <motion.p variants={fadeUp}>
            Stop juggling WhatsApp groups, physical queues, and forwarded PDFs.
            Marketplace, canteen ordering, bus booking, and notices — one place,
            built specifically for VIT students.
          </motion.p>
          <motion.div className="landing-cta-row" variants={fadeUp}>
            <Link to="/register" className="btn landing-cta">
              Join VITVerse free →
            </Link>
            <Link to="/login" className="btn btn-secondary landing-cta">
              I already have an account
            </Link>
          </motion.div>
        </motion.div>
      </header>

      <motion.section
        className="landing-stats"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={stagger}
      >
        {STATS.map((stat) => (
          <motion.div className="landing-stat" key={stat.label} variants={fadeUp}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </motion.div>
        ))}
      </motion.section>

      <section className="landing-features">
        <motion.div
          className="landing-section-heading"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
        >
          <p className="landing-eyebrow">WHY VITVERSE</p>
          <h2>Everything you already do on campus, just faster.</h2>
        </motion.div>

        <motion.div
          className="landing-feature-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              className={`landing-feature-card accent-${f.accent}`}
              variants={fadeUp}
              whileHover={{ y: -6 }}
            >
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.section
        className="landing-cta-band"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={fadeUp}
      >
        <h2>Ready to simplify your campus life?</h2>
        <p>Sign up with your VIT student email — it takes less than a minute.</p>
        <Link to="/register" className="btn landing-cta">
          Create your account →
        </Link>
      </motion.section>

      <footer className="landing-footer">
        <span>VITVerse — a student project, built on campus, for campus.</span>
      </footer>
    </div>
  );
}
