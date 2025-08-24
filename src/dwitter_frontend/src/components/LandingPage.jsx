import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Orbit</h2>
          </div>
          <div className="nav-links">
            <Link to="/auth" className="nav-btn secondary">Sign In</Link>
            <Link to="/auth" className="nav-btn primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Decentralized Microblogging
            <span className="gradient-text"> on the Internet Computer</span>
          </h1>
          <p className="hero-subtitle">
            Join the future of social media with Orbit - a censorship-resistant, 
            decentralized platform where you own your data and control your identity.
          </p>
          <div className="hero-buttons">
            <Link to="/auth" className="cta-btn primary">
              Start Posting Now
            </Link>
            <Link to="/auth" className="cta-btn secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-header">
              <div className="avatar"></div>
              <span className="username">@user123</span>
            </div>
            <p className="card-content">
              "Just posted my first dweet on Orbit! The future of social media is here 🚀"
            </p>
            <div className="card-footer">
              <span className="timestamp">2 min ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Orbit?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Authentication</h3>
              <p>Login securely with Internet Identity - no passwords, no tracking, complete privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Decentralized</h3>
              <p>Built on the Internet Computer blockchain - no central authority, no censorship.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Experience web3 speed with instant posts and real-time updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Own Your Data</h3>
              <p>Your content, your identity, your control - stored securely on the blockchain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Join the Revolution?</h2>
          <p>Be part of the future of social media</p>
          <Link to="/auth" className="cta-btn primary large">
            Get Started with Orbit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>Orbit</h3>
              <p>Decentralized microblogging on ICP</p>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#about">About</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Orbit. Built on the Internet Computer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
