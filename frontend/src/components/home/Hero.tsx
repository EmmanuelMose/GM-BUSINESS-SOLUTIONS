import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">✦ 100% Genuine Products</span>
            <h1 className="hero-title">
              Your Trusted <span className="highlight">Smart</span> Device Partner
            </h1>
            <p className="hero-text">
              SMARTP KENYA offers genuine smartphones, accessories, smart devices, 
              and reliable services at the best prices in Kenya.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-primary">Shop Now</Link>
              <Link to="/account?tab=support" className="btn-secondary">Contact Us</Link>
              <a href="https://wa.me/254712345678" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">WhatsApp Us</a>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="hero-feature-icon">✔</span>
                <span>100% Genuine Products</span>
              </div>
              <div className="hero-feature">
                <span className="hero-feature-icon">★</span>
                <span>Best Prices in Kenya</span>
              </div>
              <div className="hero-feature">
                <span className="hero-feature-icon">➜</span>
                <span>Fast & Reliable Delivery</span>
              </div>
              <div className="hero-feature">
                <span className="hero-feature-icon">⌂</span>
                <span>50+ Pickup Stations</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-logo">
                <span className="hero-logo-text">SMARTP</span>
              </div>
              <h3 className="hero-card-title">SMARTP KENYA</h3>
              <p className="hero-card-sub">Your Trusted Store</p>
              <div className="hero-card-details">
                <div className="hero-card-row">
                  <span>M-Pesa Till:</span>
                  <strong>4149288</strong>
                </div>
                <div className="hero-card-divider" />
                <div className="hero-card-row">
                  <span>Pickup Stations:</span>
                  <strong>50+</strong>
                </div>
                <div className="hero-card-divider" />
                <div className="hero-card-row">
                  <span>Delivery:</span>
                  <strong>Nationwide</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}