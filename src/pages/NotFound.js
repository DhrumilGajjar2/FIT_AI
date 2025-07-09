import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">😵 Oops! Page Not Found</h1>
      <p className="notfound-message">
        It looks like you're lost. The page you’re looking for doesn’t exist. Don’t worry, we’ll help you get back on track!
      </p>

      {/* Fun Illustration with Animation */}
      <div className="notfound-illustration">
        <img src="/images/404.svg" alt="404 Not Found" className="illustration-img" />
      </div>

      {/* Suggested Navigation with Animations */}
      <div className="notfound-links">
        <Link to="/" className="btn-primary animated-btn">🏠 Go to Home</Link>
        <Link to="/dashboard" className="btn-secondary animated-btn">📊 Dashboard</Link>
        <Link to="/login" className="btn-secondary animated-btn">🔐 Login</Link>
        <Link to="/signup" className="btn-secondary animated-btn">📝 Sign Up</Link>
        <Link to="/contact" className="btn-secondary animated-btn">📞 Contact Us</Link>
      </div>
    </div>
  );
}

export default React.memo(NotFound);
