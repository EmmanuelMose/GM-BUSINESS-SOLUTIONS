import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../productcard/ProductCard";
import Loader from "../loader/Loader";
import { productsAPI, type Product } from "../../Features/products/productsAPI";
import "./Products.css";

export default function Products() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getActive();
        if (res.success) {
          setAllProducts(res.data);
          if (search) {
            const filtered = res.data.filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
              (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
            );
            setProducts(filtered);
          } else {
            setProducts(res.data.slice(0, 8));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search]);

  if (loading) return <Loader />;

  return (
    <section id="shop-products" className="products-section">
      <div className="container">
        <div className="products-header">
          <h2 className="products-title">
            {search ? `Search Results for "${search}"` : "Best Sellers"}
          </h2>
          <p className="products-sub">
            {search ? `Found ${products.length} products` : "Highly recommended products in Kenya."}
          </p>
        </div>
        {products.length === 0 ? (
          <div className="products-empty">
            <p>No products found for "{search}".</p>
            <p>Try searching with different keywords or browse our categories.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}