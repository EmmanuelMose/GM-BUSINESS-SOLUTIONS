import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../../Features/products/productsAPI';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: (productId: number) => void;
}

export default function ProductCard({ 
  product, 
  showWishlist = false, 
  isWishlisted = false, 
  onWishlistToggle 
}: ProductCardProps) {
  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const price = parseFloat(product.price);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.productId);
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-image-wrap">
        {product.featuredPhoto ? (
          <img src={product.featuredPhoto} alt={product.name} className="product-card-image" />
        ) : (
          <div className="product-card-placeholder"><span className="product-card-placeholder-text">No image</span></div>
        )}
        {showWishlist && (
          <button
            className={`product-card-wishlist ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="product-card-content">
        <h3 className="product-card-name">{product.name}</h3>
        {product.brand && <p className="product-card-brand">{product.brand}</p>}
        <p className="product-card-price">KSh {price.toLocaleString()}</p>
        {isOutOfStock ? (
          <span className="product-card-outofstock">Out of Stock</span>
        ) : (
          <span className="product-card-view">View Details</span>
        )}
      </div>
    </Link>
  );
}