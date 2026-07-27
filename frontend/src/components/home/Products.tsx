import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductCard from "../productcard/ProductCard";
import { productsAPI, type Product } from "../../Features/products/productsAPI";
import { wishlistAPI } from "../../Features/wishlist/wishlistAPI";
import "./Product.css";

export default function Products() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getActive();
        if (res.success) {
          let filtered = res.data;
          if (search) {
            filtered = res.data.filter(p => 
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
            );
          }
          const displayed = filtered.slice(0, 8);
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
  }, [search]);

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
      <section className="products-section">
        <div className="container">
          <div className="products-header">
            <h2 className="products-title">Featured Products</h2>
            <p className="products-sub">Loading products...</p>
          </div>
          <div className="products-grid">
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

  return (
    <section className="products-section">
      <div className="container">
        <div className="products-header">
          <h2 className="products-title">{search ? `Results for "${search}"` : "Featured Products"}</h2>
          <p className="products-sub">{products.length} products found</p>
        </div>
        {products.length === 0 ? (
          <div className="products-empty">
            <p>No products found. Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
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
            <div className="products-view-all">
              <Link to="/shop" className="btn-primary">View All Products →</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}