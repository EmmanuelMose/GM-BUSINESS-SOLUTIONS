import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Heart, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categoriesAPI, type Category } from '../../Features/categories/categoriesAPI';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoriesAPI
      .getActive()
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCategoriesMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (
    e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent
  ) => {
    if (
      (e as React.KeyboardEvent).key === 'Enter' ||
      (e as React.MouseEvent).type === 'click'
    ) {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate('/');
      }

      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <div className="announcement-bar">
        <div className="container">
          <div className="announcement-content">
            <span>
              Free delivery from <strong>KSh 600</strong>
            </span>

            <span className="announcement-mid">
              Order before <strong>4:00pm</strong> for{' '}
              <strong>same-day delivery</strong> (Sun-Fri)
            </span>

            <span className="announcement-end">
              Pickup: <strong>Kakamega (Lurambi, Opp. Bamboo)</strong> - Closed{' '}
              <strong className="closed-text">Saturday</strong>
            </span>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <div className="header-content">

            <div className="left-section">
              <Link to="/" className="logo">
                Naoja <span className="logo-dot">.</span>
              </Link>

              <div className="categories-wrapper" ref={dropdownRef}>
                <button
                  className="categories-trigger"
                  onClick={() =>
                    setCategoriesMenuOpen(!categoriesMenuOpen)
                  }
                >
                  <Menu size={20} />
                  <span className="categories-label">Categories</span>
                  <ChevronDown
                    size={16}
                    className={`chevron ${
                      categoriesMenuOpen ? 'chevron-open' : ''
                    }`}
                  />
                </button>

                {categoriesMenuOpen && (
                  <div className="categories-dropdown">
                    <div className="categories-list">
                      {categories.map((cat) => (
                        <Link
                          key={cat.categoryId}
                          to={`/category/${cat.slug}`}
                          className="category-item"
                          onClick={() => setCategoriesMenuOpen(false)}
                        >
                          {cat.photo ? (
                            <img
                              src={cat.photo}
                              alt={cat.name}
                              className="category-image"
                            />
                          ) : (
                            <div className="category-image-placeholder">
                              {cat.icon || '📁'}
                            </div>
                          )}

                          <div className="category-info">
                            <p className="category-name">{cat.name}</p>

                            {cat.description && (
                              <p className="category-description">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="dropdown-footer">
                      <Link
                        to="/account?tab=support"
                        className="footer-link"
                        onClick={() => setCategoriesMenuOpen(false)}
                      >
                        Customer Support
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="search-wrapper">
              <Search
                size={16}
                className="search-icon"
                onClick={handleSearch}
              />

              <input
                type="text"
                placeholder="Search phones, TVs, solar, appliances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="search-input"
              />
            </div>

            {/* RIGHT SECTION */}
            <div className="right-section">

              {/* LOGIN BUTTON */}
              <Link to="/login" className="login-button">
                <User size={18} />
                <span>Login</span>
              </Link>

              <Link to="/account" className="icon-button">
                <User size={20} />
                <span className="icon-label">Account</span>
              </Link>

              <Link
                to="/account?tab=wishlist"
                className="icon-button"
              >
                <Heart size={20} />
                <span className="icon-label">Wishlist</span>
              </Link>

              <Link to="/cart" className="icon-button">
                <ShoppingCart size={20} />

                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>

              <button
                className="mobile-menu-trigger"
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
              >
                {mobileMenuOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link
              to="/"
              className="logo"
              onClick={() => setMobileMenuOpen(false)}
            >
              Naoja <span className="logo-dot">.</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="mobile-search">
            <Search size={16} className="mobile-search-icon" />

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={handleSearch}
              className="mobile-search-input"
            />
          </div>

          <nav className="mobile-nav">
            <p className="mobile-nav-title">Categories</p>

            {categories.map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/category/${cat.slug}`}
                className="mobile-nav-link"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                {cat.name}
              </Link>
            ))}

            <div className="mobile-divider" />

            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/account"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Account
            </Link>

            <Link
              to="/account?tab=wishlist"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}