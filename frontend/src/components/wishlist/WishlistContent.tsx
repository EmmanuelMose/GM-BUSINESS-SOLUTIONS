import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { wishlistAPI, type WishlistItem } from '../../Features/wishlist/wishlistAPI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import './WishlistContent.css';

export default function WishlistContent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { decrement } = useWishlist();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=wishlist');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.success) {
        setItems(res.data);
      } else {
        setError('Failed to load wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      const res = await wishlistAPI.remove(productId);
      if (res.success) {
        setItems(items.filter(item => item.productId !== productId));
        decrement();
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setToast({ message: 'Failed to remove item. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    setToast({ message: `${product.name} added to cart!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="wishlist-loader"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-error">
        <AlertCircle size={48} />
        <h2>{error}</h2>
        <button className="btn-primary" onClick={() => fetchWishlist()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="wishlist-content">
      <div className="container">
        {toast && (
          <div className={`wishlist-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-sub">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding your favorite products to your wishlist</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <div key={item.wishlistId} className="wishlist-item slide-up">
                <div className="wishlist-item-image">
                  {item.product?.featuredPhoto ? (
                    <img src={item.product.featuredPhoto} alt={item.product.name} />
                  ) : (
                    <div className="wishlist-item-placeholder">📦</div>
                  )}
                  <button
                    className="wishlist-item-remove"
                    onClick={() => handleRemove(item.productId)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="wishlist-item-info">
                  <Link to={`/product/${item.product?.slug}`} className="wishlist-item-name">
                    {item.product?.name}
                  </Link>
                  {item.product?.brand && (
                    <p className="wishlist-item-brand">{item.product.brand}</p>
                  )}
                  <p className="wishlist-item-price">
                    KSh {parseFloat(item.product?.price || '0').toLocaleString()}
                  </p>
                  <div className="wishlist-item-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleAddToCart(item.product)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleRemove(item.productId)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}