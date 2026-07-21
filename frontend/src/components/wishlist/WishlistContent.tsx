import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { wishlistAPI, type WishlistItem } from '../../Features/wishlist/wishlistAPI';
import { useCart } from '../context/CartContext';
import './WishlistContent.css';

export default function WishlistContent() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await wishlistAPI.getWishlist();
        if (res.success) setItems(res.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      const res = await wishlistAPI.remove(productId);
      if (res.success) {
        setItems(items.filter(item => item.productId !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  if (loading) {
    return <div className="wishlist-loading">Loading your wishlist...</div>;
  }

  return (
    <div className="wishlist-content">
      <div className="container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-sub">Save your favorite items and shop later</p>
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
              <div key={item.wishlistId} className="wishlist-item">
                <div className="wishlist-item-image">
                  {item.product?.featuredPhoto ? (
                    <img src={item.product.featuredPhoto} alt={item.product.name} />
                  ) : (
                    <span>No image</span>
                  )}
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
                      <ShoppingBag size={16} /> Add to Cart
                    </button>
                    <button
                      className="btn-danger btn-sm"
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