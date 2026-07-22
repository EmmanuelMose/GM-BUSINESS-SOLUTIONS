
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../productcard/ProductCard";
import Loader from "../loader/Loader";
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
          setProducts(filtered.slice(0, 8));

          // Fetch wishlist status for each product
          const statuses: Record<number, boolean> = {};
          for (const p of filtered.slice(0, 8)) {
            const wRes = await wishlistAPI.check(p.productId);
            if (wRes.success) {
              statuses[p.productId] = wRes.data;
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

  if (loading) return <Loader />;

  return (
    <section id="shop-products" className="products-section">
      <div className="container">
        <div className="products-header">
          <h2 className="products-title">{search ? `Results for "${search}"` : "Best Sellers"}</h2>
          <p className="products-sub">{products.length} {products.length === 1 ? "product" : "products"} found</p>
        </div>
        {products.length === 0 ? (
          <div className="products-empty">
            <p>No products found for "{search}". Try a different search term.</p>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}