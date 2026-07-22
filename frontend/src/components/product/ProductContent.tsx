
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import QuantityControl from "../quantitycontrol/QuantityControl";
import ProductCard from "../productcard/ProductCard";
import Loader from "../loader/Loader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { productsAPI, type Product } from "../../Features/products/productsAPI";
import "./ProductContent.css";
import { wishlistAPI } from "../../Features/wishlist/wishlistAPI";

export default function ProductContent() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getBySlug(slug!);
        if (res.success) {
          setProduct(res.data);
          const all = await productsAPI.getActive();
          if (all.success) {
            const relatedItems = all.data.filter(
              p => p.categoryId === res.data.categoryId && p.productId !== res.data.productId
            ).slice(0, 4);
            setRelated(relatedItems);
          }
          // Check wishlist status only if authenticated
          if (isAuthenticated) {
            // We need to fetch wishlist status – but we can also use the API directly
            // For simplicity we'll call the API directly, or you could manage state via context.
            // But we'll do a direct call here.
            const wishlistRes = await wishlistAPI.check(res.data.productId);
            if (wishlistRes.success) {
              setIsWishlisted(wishlistRes.data);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, isAuthenticated]);

  const handleAdd = () => {
    if (product) {
      addItem(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuy = () => {
    if (product) {
      addItem(product, quantity);
      navigate("/checkout");
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=product/${product.slug}`);
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.productId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product.productId);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="product-notfound">Product not found</div>;

  const price = parseFloat(product.price);
  const isOut = product.status === "out_of_stock" || product.stock <= 0;

  return (
    <div className="product-content">
      <div className="container">
        <div className="product-top">
          <div className="product-breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span className="current">{product.name}</span>
          </div>
          <button className="product-back" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="product-grid">
          <div className="product-image">
            {product.featuredPhoto ? <img src={product.featuredPhoto} alt={product.name} /> : <span>No image</span>}
          </div>

          <div className="product-info">
            <div>{isOut ? <span className="product-status out">Out of stock</span> : <span className="product-status in">In stock</span>}</div>
            <h1 className="product-name">{product.name}</h1>
            {product.brand && <p className="product-brand">Brand: {product.brand}</p>}
            <div className="product-price-wrap">
              <p className="product-price-label">Price</p>
              <p className="product-price">KSh {price.toLocaleString()}</p>
            </div>
            {product.description && <p className="product-desc">{product.description}</p>}
            <div className="product-qty">
              <span>Quantity</span>
              <QuantityControl quantity={quantity} onIncrease={() => setQuantity(q => q + 1)} onDecrease={() => setQuantity(q => Math.max(1, q - 1))} size="sm" />
            </div>
            <div className="product-actions">
              <button className="product-add" onClick={handleAdd} disabled={added || isOut}>
                {added ? "Added!" : "Add to Cart"}
              </button>
              <button className="product-buy" onClick={handleBuy} disabled={isOut}>
                Buy Now
              </button>
            </div>
            <button
              className={`product-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              {isWishlisted ? <Check size={16} /> : <Heart size={16} />}
              {isWishlisted ? " Added to Wishlist" : " Add to Wishlist"}
            </button>
            <a href={`https://wa.me/254704812343?text=${encodeURIComponent(`Hello GMNEX, I am inquiring about the product: ${product.name} (Price: KSh ${price.toLocaleString()}). Is it currently in stock?`)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp product-whatsapp">Inquire via WhatsApp</a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="product-related">
            <h2 className="product-related-title">Related Products</h2>
            <div className="product-related-grid">
              {related.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}