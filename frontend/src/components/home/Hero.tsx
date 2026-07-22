import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">✓ Genuine Electronics & Accessories</span>
            <h1 className="hero-title">Your Trusted Electrical & Electronics Partner</h1>
            <p className="hero-text">GMNEX offers a wide variety of genuine smartphones, computers, solar accessories, and home appliances at affordable prices. Pay conveniently via M-Pesa and pickup from over 50 stations across Kenya.</p>
            <div className="hero-actions">
              <a href="#shop-products" className="btn-primary">Shop Now</a>
              <Link to="/account?tab=support" className="btn-secondary">Contact Us</Link>
              <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">WhatsApp Us</a>
            </div>
            <div className="hero-tags">
              <span className="hero-tag">📍 Nationwide Pickup</span>
              <span className="hero-tag">📞 0704812343</span>
              <span className="hero-tag">🕒 Sun - Thu: 8:30 AM - 8:00 PM | Fri: 8:30 AM - 3:00 PM</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-logo"><span className="hero-logo-text">GMNEX</span></div>
              <h3 className="hero-card-title">GMNEX</h3>
              <p className="hero-card-sub">Kenya</p>
              <div className="hero-card-details">
                <div className="hero-card-row"><span>M-Pesa Buy Goods Till:</span><strong>4149288</strong></div>
                <div className="hero-card-divider" />
                <div className="hero-card-row"><span>Pickup:</span><strong>50+ Stations</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}