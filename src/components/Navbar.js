import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Get current path for active link
  const isLoggedIn = localStorage.getItem("token"); // Check if user is logged in
  const navRef = useRef(null); // Reference to detect clicks outside menu

  // ✅ Toggle Mobile Menu
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // ✅ Close Menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ✅ Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          FitAI
        </Link>

        {/* ✅ Mobile Menu Icon */}
        <button 
          className="menu-icon" 
          onClick={toggleMenu} 
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* ✅ Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""} onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/diet-plan" className={location.pathname === "/diet-plan" ? "active" : ""} onClick={closeMenu}>
              Diet Plan
            </Link>
          </li>
          <li>
            <Link to="/workout-plan" className={location.pathname === "/workout-plan" ? "active" : ""} onClick={closeMenu}>
              Workout Plan
            </Link>
          </li>
          <li>
            <Link to="/user-data" className={location.pathname === "/user-data" ? "active" : ""} onClick={closeMenu}>
              User Data
            </Link>
          </li>

          {/* ✅ Show Profile & Logout if Logged In */}
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""} onClick={closeMenu}>
                  Profile
                </Link>
              </li>
              <li>
                <button 
                  className="logout-btn" 
                  onClick={() => {
                    localStorage.removeItem("token");
                    closeMenu();
                    window.location.href = "/login"; 
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={location.pathname === "/login" ? "active" : ""} onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className={location.pathname === "/signup" ? "active" : ""} onClick={closeMenu}>
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
