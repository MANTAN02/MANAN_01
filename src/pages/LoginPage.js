import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles.css";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    try {
      await login(email, password);
      navigate("/browse");
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      navigate("/browse");
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Sign In</h2>
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          className="button google-button full-width"
          style={{ 
            backgroundColor: '#4285f4', 
            color: 'white', 
            border: 'none',
            marginBottom: '16px'
          }}
        >
          Continue with Google
        </button>
        <div style={{ textAlign: "center", margin: "16px 0", color: "#aaa" }}>or</div>
        {error && <div className="login-error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="button full-width">Login</button>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </div>
      </form>
      <button
        type="button"
        className="button full-width"
        style={{ marginTop: 12, background: '#aaa', color: 'white' }}
        onClick={() => navigate('/browse')}
      >
        Skip for now
      </button>
    </div>
  );
} 