import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";;

function Login() {
  const [email, setEmail] = useState("");
  const passwordRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const password = passwordRef.current.value.trim();

    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const userData = await loginUser({ email: trimmedEmail, password });

      // Save to localStorage
      localStorage.setItem("token", userData.token);
      localStorage.setItem("username", userData.name);
      localStorage.setItem("age", userData.age);
      localStorage.setItem("weight", userData.weight);
      localStorage.setItem("height", userData.height);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          ref={passwordRef}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
