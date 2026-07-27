import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Heart, Menu, X, LogOut, ChevronDown, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { categoriesAPI, type Category } from "../../Features/categories/categoriesAPI";
import { productsAPI, type Product } from "../../Features/products/productsAPI";
import "./Header.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) {
    return null;
  }

  useEffect(() => {
    categoriesAPI.getActive().then((res) => {
      if (res.success) setCategories(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      setIsSearching(true);
      productsAPI.search(query.trim())
        .then((res) => {
          if (res.success) {
            setSearchResults(res.data.slice(0, 6));
            setShowSearchResults(true);
          }
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e as React.KeyboardEvent).key === "Enter" || (e as React.MouseEvent).type === "click") {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        setShowSearchResults(false);
      }
    }
  };

  const handleSearchResultClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.clear();
      window.location.replace("/");
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Services', path: '/category/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/account?tab=support' },
  ];

  if (loading) {
    return (
      <div className="announcement-bar">
        <div className="container">
          <div className="announcement-content">
            <span>📞 Need Help? Call / WhatsApp: <strong>0712 345 678</strong></span>
            <span className="announcement-end">📍 Pickup from 50+ stations</span>
          </div>
        </div>
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="left-section">
                <Link to="/" className="logo">SMARTP<span className="logo-dot">.</span></Link>
              </div>
              <div className="right-section">
                <div className="loading-placeholder">Loading...</div>
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <>
      <div className="announcement-bar">
        <div className="container">
          <div className="announcement-content">
            <span>📞 Need Help? Call / WhatsApp: <strong>0712 345 678</strong></span>
            <span className="announcement-end">📍 Pickup from 50+ stations</span>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="left-section">
              <Link to="/" className="logo">SMARTP<span className="logo-dot">.</span></Link>
              
              <div className="categories-wrapper" ref={dropdownRef}>
                <button className="categories-trigger" onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}>
                  <span>Categories</span>
                  <ChevronDown size={16} className={`chevron ${categoriesMenuOpen ? "chevron-open" : ""}`} />
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
                            <img src={cat.photo} alt={cat.name} className="category-item-image" />
                          ) : (
                            <span className="category-item-icon">{cat.icon || '📁'}</span>
                          )}
                          <span className="category-item-name">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="nav-links">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="right-section">
              {isAuthenticated ? (
                <>
                  <span className="user-greeting desktop-only">Hi, {user?.fullName || 'User'}</span>
                  <button onClick={handleLogout} className="logout-button desktop-only" aria-label="Logout">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="login-button desktop-only">
                  <User size={18} /><span>Login</span>
                </Link>
              )}
              
              <Link to="/account" className="icon-button desktop-only">
                <User size={20} />
              </Link>
              
              <Link to="/wishlist" className="icon-button">
                <Heart size={20} />
                {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
              </Link>
              
              <Link to="/cart" className="icon-button">
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              
              <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="search-bar-container" ref={searchRef}>
        <div className="container">
          <div className="search-bar-wrapper">
            <Search size={20} className="search-bar-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery} 
              onChange={handleSearchInputChange}
              onKeyDown={handleSearch} 
              className="search-bar-input" 
              onFocus={() => {
                if (searchQuery.trim().length > 0 && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            <button className="search-bar-btn" onClick={handleSearch}>Search</button>
          </div>
          
          {showSearchResults && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((product) => (
                    <div 
                      key={product.productId} 
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(product.slug)}
                    >
                      <div className="search-result-image">
                        {product.featuredPhoto ? (
                          <img src={product.featuredPhoto} alt={product.name} />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div className="search-result-info">
                        <span className="search-result-name">{product.name}</span>
                        <span className="search-result-price">KSh {parseFloat(product.price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  <div className="search-result-view-all">
                    <button onClick={() => {
                      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
                      setShowSearchResults(false);
                    }}>
                      View all results →
                    </button>
                  </div>
                </>
              ) : (
                <div className="search-no-results">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>SMARTP<span className="logo-dot">.</span></Link>
            <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
          </div>
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </Link>
            ))}
            <div className="mobile-divider" />
            <p className="mobile-nav-title">Categories</p>
            {categories.map((cat) => (
              <Link key={cat.categoryId} to={`/category/${cat.slug}`} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                {cat.photo ? (
                  <span className="mobile-category-image-wrapper">
                    <img src={cat.photo} alt={cat.name} className="mobile-category-image" />
                  </span>
                ) : (
                  <span>{cat.icon || '📁'}</span>
                )}
                {cat.name}
              </Link>
            ))}
            <div className="mobile-divider" />
            {isAuthenticated ? (
              <>
                <span className="mobile-user">Hi, {user?.fullName}</span>
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">Logout</button>
              </>
            ) : (
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
            <Link to="/account" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
            <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
          </nav>
        </div>
      )}
    </>
  );
}