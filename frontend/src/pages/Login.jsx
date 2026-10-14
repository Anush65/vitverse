import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed");
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <div className="brand-heading">VITVerse</div>
        <h1>Welcome back</h1>
        <p>Log in with your VIT student email</p>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="VIT email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-error">{error}</p>}
          <button type="submit" className="btn">
            Login
          </button>
        </form>
        <div className="divider">or</div>
        <div className="google-btn-wrap">
          <GoogleLogin
            theme={theme === "dark" ? "filled_black" : "outline"}
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>
        <p className="switch-link">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
