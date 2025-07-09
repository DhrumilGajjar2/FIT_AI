import React from "react";
//import facebookIcon from "../../assets/icons/facebook.svg";
//import twitterIcon from "../../assets/icons/twitter.svg";
//import instagramIcon from "../../assets/icons/instagram.svg";
//import linkedinIcon from "../../assets/icons/linkedin.svg";



function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* About Section */}
        <div className="footer-section">
          <h3>About FitAI</h3>
          <p>FitAI is your AI-powered fitness assistant, offering personalized diet and workout plans tailored to your goals.</p>
        </div>

        {/* Quick Links */}
        <nav className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/diet-plan">Diet Plan</a></li>
            <li><a href="/workout-plan">Workout Plan</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Signup</a></li>
          </ul>
        </nav>

        {/* Contact Section */}
        <address className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:support@fitai.com">support@fitai.com</a></p>
          <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
          <p>Location: Ahmedabad, India</p>
        </address>

        {/* Social Media Links */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
             { /* <img src={facebookIcon} alt="Facebook" /> */}
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            { /*  <img src={twitterIcon} alt="Twitter" /> */}
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            { /*  <img src={instagramIcon} alt="Instagram" /> */}
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            { /*  <img src={linkedinIcon} alt="LinkedIn" /> */}
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FitAI. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
