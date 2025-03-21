import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <h1>Transform Your Health with AI</h1>
        <p>Get personalized diet & workout plans tailored just for you.</p>
        <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn-primary">
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </Link>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature">
          <h2>🔬 AI-Powered Recommendations</h2>
          <p>Get data-driven meal & exercise plans based on your goals.</p>
        </div>
        <div className="feature">
          <h2>📊 Track Your Progress</h2>
          <p>Monitor your diet, workout, and improvements over time.</p>
        </div>
        <div className="feature">
          <h2>🤖 24/7 AI Chatbot Support</h2>
          <p>Ask anything about fitness, diet, and workouts anytime.</p>
        </div>
        <div className="feature">
          <h2>⚡ Instant Plan Updates</h2>
          <p>Your diet & workout plans evolve as your fitness improves.</p>
        </div>
      </section>

      {/* AI-Powered Goal Setting */}
      <section className="goal-setting-section">
        <h2>🎯 Achieve Your Fitness Goals with AI</h2>
        <p>
          Our AI adapts to your progress and suggests the best exercises and diet plans. Whether 
          you want to lose weight, gain muscle, or stay fit, our system customizes your routine daily.
        </p>
        <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn-primary">
          Start Your AI Fitness Plan
        </Link>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>💬 What Our Users Say</h2>
        <div className="testimonial">
          <p>“FitAI helped me lose 10kg in just 3 months! The personalized AI workout plans are amazing.”</p>
          <h4>- Rahul P.</h4>
        </div>
        <div className="testimonial">
          <p>“I finally found a diet plan that works for me. The AI chatbot also answers all my questions!”</p>
          <h4>- Sneha M.</h4>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="faq-section">
        <h2>❓ Frequently Asked Questions</h2>
        <details>
          <summary>How does the AI create my diet & workout plan?</summary>
          <p>Our AI analyzes your age, weight, height, fitness goals, and activity level to generate the best personalized plan for you.</p>
        </details>
        <details>
          <summary>Is FitAI free to use?</summary>
          <p>Yes! You can access basic diet and workout plans for free. Premium features may be available soon.</p>
        </details>
        <details>
          <summary>Can I change my fitness goal later?</summary>
          <p>Absolutely! You can update your fitness goal anytime, and your AI-powered plan will adjust accordingly.</p>
        </details>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to Start Your Fitness Journey?</h2>
        <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn-secondary">
          {isAuthenticated ? "Go to Dashboard" : "Join Now"}
        </Link>
      </section>
    </div>
  );
}

export default React.memo(Home);
