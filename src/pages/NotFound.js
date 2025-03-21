import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="notfound-container">
      <h1>😵 Oops! Page Not Found</h1>
      <p>It looks like you're lost. The page you’re looking for doesn’t exist.</p>

      {/* Fun Illustration (Can be replaced with an actual image) */}
      <div className="notfound-illustration">
        <img src="/images/404.svg" alt="404 Not Found" />
      </div>

      {/* Suggested Navigation */}
      <div className="notfound-links">
        <Link to="/" className="btn-primary">🏠 Go to Home</Link>
        <Link to="/dashboard" className="btn-secondary">📊 Dashboard</Link>
        <Link to="/login" className="btn-secondary">🔐 Login</Link>
        <Link to="/signup" className="btn-secondary">📝 Sign Up</Link>
        <Link to="/contact" className="btn-secondary">📞 Contact Us</Link>
      </div>
    </div>
  );
}

export default React.memo(NotFound);
