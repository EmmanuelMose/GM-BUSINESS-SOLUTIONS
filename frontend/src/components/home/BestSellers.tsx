import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../productcard/ProductCard";
import { productsAPI, type Product } from "../../Features/products/productsAPI";
import { wishlistAPI } from "../../Features/wishlist/wishlistAPI";
import "./BestSellers.css";

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getBestSellers();
        if (res.success) {
          const displayed = res.data.slice(0, 8);
          setProducts(displayed);

          const statuses: Record<number, boolean> = {};
          for (const p of displayed) {
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      console.error("Error toggling wishlist:", error);
      alert("Please login to add to wishlist");
    }
  };

  if (loading) {
    return (
      <section className="bestsellers-section">
        <div className="container">
          <div className="bestsellers-header">
            <h2 className="bestsellers-title">Best Sellers</h2>
            <p className="bestsellers-sub">Loading best sellers...</p>
          </div>
          <div className="bestsellers-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="product-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bestsellers-section">
      <div className="container">
        <div className="bestsellers-header">
          <div>
            <h2 className="bestsellers-title">Best Sellers</h2>
            <p className="bestsellers-sub">Our most popular products</p>
          </div>
          <Link to="/shop" className="bestsellers-view-all">View All →</Link>
        </div>
        <div className="bestsellers-grid">
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
      </div>
    </section>
  );
}