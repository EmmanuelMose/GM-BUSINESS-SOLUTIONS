import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QuantityControl from '../quantitycontrol/QuantityControl';
import FulfillmentModule from '../fulfillmentmodule/FulfillmentModule';
import ProductCard from '../productcard/ProductCard';
import Loader from '../loader/Loader';
import { useCart } from '../context/CartContext';
import { productsAPI, type Product } from '../../Features/products/productsAPI';
import './ProductContent.css';

export default function ProductContent() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getBySlug(slug!);
        if (res.success) {
          setProduct(res.data);
          const all = await productsAPI.getActive();
          if (all.success) {
            const related = all.data.filter(p => p.categoryId === res.data.categoryId && p.productId !== res.data.productId).slice(0, 4);
            setRelated(related);
          }
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [slug]);

  const handleAdd = () => { if (product) { addItem(product, quantity); setAdded(true); setTimeout(() => setAdded(false), 2000); } };
  const handleBuy = () => { if (product) { addItem(product, quantity); navigate('/checkout'); } };

  if (loading) return <Loader />;
  if (!product) return <div className="product-notfound">Product not found</div>;

  const price = parseFloat(product.price);
  const isOut = product.status === 'out_of_stock' || product.stock <= 0;

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
            <FulfillmentModule subtotal={price * quantity} />
            <div className="product-actions">
              <button className="product-add" onClick={handleAdd} disabled={added || isOut}>
                {added ? 'Added!' : 'Add to Cart'}
              </button>
              <button className="product-buy" onClick={handleBuy} disabled={isOut}>
                Buy Now
              </button>
            </div>
            <a href={`https://wa.me/254704812343?text=${encodeURIComponent(`Hello Naoja Ventures, I am inquiring about the product: ${product.name} (Price: KSh ${price.toLocaleString()}). Is it currently in stock?`)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp product-whatsapp">Inquire via WhatsApp</a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="product-related">
            <h2 className="product-related-title">Related Products</h2>
            <div className="product-related-grid">{related.map(p => <ProductCard key={p.productId} product={p} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}