import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../productcard/ProductCard';
import Loader from '../loader/Loader';
import { productsAPI, type Product } from '../../Features/products/productsAPI';
import { wishlistAPI } from '../../Features/wishlist/wishlistAPI';
import './ShopContent.css';

export default function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getActive();
        if (res.success) {
          setProducts(res.data);
          const statuses: Record<number, boolean> = {};
          for (const p of res.data) {
            try {
              const wRes = await wishlistAPI.check(p.productId);
              if (wRes.success) {
                statuses[p.productId] = wRes.data;
              }
            } catch {
              statuses[p.productId] = false;
            }
          }
          setWishlistStatus(statuses);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleWishlistToggle = async (productId: number) => {
    const currentlyWishlisted = wishlistStatus[productId] || false;
    try {
      if (currentlyWishlisted) {
        await wishlistAPI.remove(productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: false }));
      } else {
        await wishlistAPI.add(productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: true }));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Please login to add to wishlist');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span className="current">Shop</span>
        </div>
        <h1 className="shop-title">Shop All Products</h1>
        <p className="shop-count">{products.length} products available</p>
        
        {products.length === 0 ? (
          <div className="shop-empty">No products available</div>
        ) : (
          <div className="shop-grid">
            {products.map(p => (
              <ProductCard
                key={p.productId}
                product={p}
                showWishlist={true}
                isWishlisted={wishlistStatus[p.productId] || false}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}