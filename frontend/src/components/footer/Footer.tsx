import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">Naoja <span className="footer-logo-dot">.</span></Link>
            <p className="footer-brand-text">Your Trusted Electrical & Electronics Partner in Kakamega. Providing genuine products, convenient payments, and fast fulfillment.</p>
            <p className="footer-location">Location: Lurambi, Kakamega, Opposite Bamboo.</p>
          </div>
          <div>
            <h4 className="footer-heading">Business Hours</h4>
            <p className="footer-text">Sunday – Thursday: 8:30 AM – 8:00 PM</p>
            <p className="footer-text">Friday: 8:30 AM – 3:00 PM</p>
            <p className="footer-closed">Saturday: Closed</p>
          </div>
          <div>
            <h4 className="footer-heading">Quick Support</h4>
            <p className="footer-text">Call/SMS: <a href="tel:0704812343" className="footer-link">0704812343</a></p>
            <p className="footer-text">WhatsApp: <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="footer-link">0704812343</a></p>
            <p className="footer-text">Email: <a href="mailto:enquiries@naojaventures.com" className="footer-link">enquiries@naojaventures.com</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Naoja Ventures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}