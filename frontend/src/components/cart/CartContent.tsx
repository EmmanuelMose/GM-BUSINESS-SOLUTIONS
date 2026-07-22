import { Link } from "react-router-dom";
import QuantityControl from "../quantitycontrol/QuantityControl";
import { useCart } from "../context/CartContext";
import "./CartContent.css";

export default function CartContent() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div className="cart-empty-icon">🛒</div>
          <h1 className="cart-empty-title">Your Cart is Empty</h1>
          <p className="cart-empty-text">Explore our categories to add electronic and electrical products.</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-content">
      <div className="container">
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span className="current">Cart</span>
        </div>
        <h1 className="cart-title">Shopping Cart</h1>
        <div className="cart-grid">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.product.productId} className="cart-item">
                <div className="cart-item-image">
                  {item.product.featuredPhoto ? <img src={item.product.featuredPhoto} alt={item.product.name} /> : <span>No img</span>}
                </div>
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.product.name}</h3>
                  <p className="cart-item-brand">{item.product.brand}</p>
                  <p className="cart-item-price">KSh {parseFloat(item.product.price).toLocaleString()}</p>
                </div>
                <div className="cart-item-actions">
                  <QuantityControl quantity={item.quantity} onIncrease={() => updateQuantity(item.product.productId, item.quantity + 1)} onDecrease={() => updateQuantity(item.product.productId, item.quantity - 1)} size="sm" />
                  <button className="cart-item-remove" onClick={() => removeItem(item.product.productId)}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-row"><span>Subtotal</span><strong>KSh {total.toLocaleString()}</strong></div>
            <hr className="cart-summary-divider" />
            <div className="cart-summary-total"><strong>Total</strong><strong className="cart-summary-grand">KSh {total.toLocaleString()}</strong></div>
            <Link to="/checkout" className="btn-primary btn-full cart-summary-checkout">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}