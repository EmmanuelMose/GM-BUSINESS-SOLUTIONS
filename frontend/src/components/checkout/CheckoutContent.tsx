import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../../Features/orders/ordersAPI';
import { getDeliveryFee, isFreeDelivery, STORE_LOCATION, formatDeliveryMessageForExport, formatPickupMessageForExport } from '../fulfillmentmodule/FulfillmentModule';
import './CheckoutContent.css';

const TILL_NUMBER = '4149288';
const STEPS = ['Details', 'Payment', 'Confirm'];

export default function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', phone: '', area: '', directions: '', fulfillment: 'delivery' });
  const [mpesaRef, setMpesaRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedTill, setCopiedTill] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const deliveryFee = getDeliveryFee(total);
  const grandTotal = total + deliveryFee;

  const copyTill = () => { navigator.clipboard.writeText(TILL_NUMBER); setCopiedTill(true); setTimeout(() => setCopiedTill(false), 2000); };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = 'Name is required';
    if (!formData.phone.trim()) e.phone = 'Phone is required';
    if (formData.fulfillment === 'delivery' && !formData.area.trim()) e.area = 'Area is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!mpesaRef.trim()) e.mpesaRef = 'M-Pesa transaction code is required';
    if (mpesaRef.trim().length < 8) e.mpesaRef = 'Invalid M-Pesa transaction code format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setServerError('');
    try {
      const payload = {
        items: items.map(item => ({ productId: item.product.productId, quantity: item.quantity, price: parseFloat(item.product.price) })),
        total: formData.fulfillment === 'delivery' ? grandTotal : total,
        subtotal: total,
        tax: 0,
        shippingCost: formData.fulfillment === 'delivery' ? deliveryFee : 0,
        discount: 0,
        couponCode: null,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          area: formData.area,
          directions: formData.directions,
          fulfillment: formData.fulfillment,
        },
        billingAddress: { fullName: formData.fullName, phone: formData.phone },
        deliveryNotes: formData.directions || '',
        guestEmail: '',
        guestPhone: formData.phone,
        userId: null,
      };
      await ordersAPI.create(payload);
      setSubmitted(true);
      clearCart();
    } catch (err: any) {
      setServerError(err.message || 'Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="checkout-confirm">
        <div className="container">
          <div className="checkout-confirm-box">
            <div className="checkout-confirm-icon">✓</div>
            <h1 className="checkout-confirm-title">Order Confirmed!</h1>
            <p className="checkout-confirm-sub">Thank you, <strong>{formData.fullName}</strong>.</p>
            <p className="checkout-confirm-desc">{formData.fulfillment === 'delivery' ? `Your order will be delivered to ${formData.area}. ${formatDeliveryMessageForExport()}` : `Your order will be ready for pickup at ${STORE_LOCATION} in 1–2 hours.`}</p>
            <div className="checkout-confirm-ref">
              <p className="checkout-confirm-ref-label">M-Pesa Reference</p>
              <p className="checkout-confirm-ref-code">{mpesaRef.toUpperCase()}</p>
            </div>
            <Link to="/" className="btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-content">
      <div className="container">
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <Link to="/cart">Cart</Link> <span>/</span> <span className="current">Checkout</span>
        </div>

        <div className="checkout-steps">
          {STEPS.map((label, i) => (
            <div key={label} className="checkout-step">
              <div className={`checkout-step-dot ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`checkout-step-label ${step === i + 1 ? 'active' : ''}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`checkout-step-line ${step > i + 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          <div className="checkout-forms">
            {serverError && <div className="checkout-error">{serverError}</div>}

            {step === 1 && (
              <div className="checkout-card">
                <h2 className="checkout-card-title">Your Details</h2>
                <p className="checkout-card-sub">Please provide contact info so we can coordinate your order.</p>
                <div className="checkout-field"><label className="checkout-label">Full Name</label><input type="text" className={`checkout-input ${errors.fullName ? 'error' : ''}`} value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g., Jane Naliaka" /></div>
                <div className="checkout-field"><label className="checkout-label">Phone Number (M-Pesa)</label><input type="tel" className={`checkout-input ${errors.phone ? 'error' : ''}`} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g., 0712345678" /></div>
                <hr className="checkout-divider" />
                <h2 className="checkout-card-title">Fulfillment</h2>
                <p className="checkout-card-sub">Choose how you want to receive your items.</p>
                <div className="checkout-fulfillment">
                  <button className={`checkout-fulfillment-btn ${formData.fulfillment === 'delivery' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, fulfillment: 'delivery' })}>
                    <span>🚚</span>
                    <span>Delivery</span>
                    <small>Sun–Fri 8:30am–4:00pm</small>
                  </button>
                  <button className={`checkout-fulfillment-btn ${formData.fulfillment === 'pickup' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, fulfillment: 'pickup' })}>
                    <span>🏪</span>
                    <span>Pickup</span>
                    <small>Ready in 1–2 hours</small>
                  </button>
                </div>
                {formData.fulfillment === 'delivery' && (
                  <div className="checkout-delivery-fields">
                    <div className="checkout-field"><label className="checkout-label">Delivery Area / Estate (Kakamega)</label><input type="text" className={`checkout-input ${errors.area ? 'error' : ''}`} value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="e.g., Lurambi, Kefinco, Amalemba" /></div>
                    <div className="checkout-field"><label className="checkout-label">Directions / Landmark (Optional)</label><textarea rows={2} className="checkout-textarea" value={formData.directions} onChange={e => setFormData({ ...formData, directions: e.target.value })} placeholder="e.g., Next to the red kiosk, third gate on the left" /></div>
                  </div>
                )}
                {formData.fulfillment === 'pickup' && (
                  <div className="checkout-pickup">
                    <span>📍</span>
                    <div>
                      <p>{STORE_LOCATION}</p>
                      <p>{formatPickupMessageForExport()}</p>
                      <p>Hours: Sun-Thu 8:30am-8:00pm · Fri 8:30am-3:00pm</p>
                    </div>
                  </div>
                )}
                <div className="checkout-nav">
                  <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment →</button>
                  <Link to="/cart" className="btn-secondary">Back to Cart</Link>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-card">
                <h2 className="checkout-card-title">Pay via M-Pesa</h2>
                <p className="checkout-card-sub">Complete payment via Till, then input the confirmation transaction code.</p>
                <div className="checkout-till">
                  <div>
                    <p>Amount Due</p>
                    <p>KSh {grandTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p>Buy Goods Till</p>
                    <p>{TILL_NUMBER}</p>
                    <button className="checkout-copy" onClick={copyTill}>{copiedTill ? '✓ Copied!' : '📋 Copy Till'}</button>
                  </div>
                </div>
                <div className="checkout-steps-list">
                  <p>Lipa na M-Pesa Steps</p>
                  <ol>
                    <li><span>1</span> Open the M-Pesa menu or App on your phone.</li>
                    <li><span>2</span> Select Lipa na M-Pesa, then Buy Goods and Services.</li>
                    <li><span>3</span> Enter Till Number: <strong>{TILL_NUMBER}</strong></li>
                    <li><span>4</span> Enter Amount: <strong>KSh {grandTotal.toLocaleString()}</strong></li>
                    <li><span>5</span> Enter your M-Pesa PIN and complete transaction.</li>
                    <li><span>6</span> Paste the transaction code from the confirmation SMS below.</li>
                  </ol>
                </div>
                <div className="checkout-field"><label className="checkout-label">M-Pesa Transaction Code</label><input type="text" className={`checkout-input ${errors.mpesaRef ? 'error' : ''}`} value={mpesaRef} onChange={e => setMpesaRef(e.target.value.toUpperCase())} placeholder="e.g., RG7X2YZABC" style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }} /></div>
                <div className="checkout-nav">
                  <button className="btn-primary" onClick={() => { if (validateStep2()) setStep(3); }}>Verify &amp; Continue →</button>
                  <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-card">
                <h2 className="checkout-card-title">Review &amp; Confirm</h2>
                <p className="checkout-card-sub">Double check order details before final submission.</p>
                <div className="checkout-review-grid">
                  <div className="checkout-review-box">
                    <p>Customer &amp; Delivery</p>
                    <p>{formData.fullName}</p>
                    <p>{formData.phone}</p>
                    {formData.fulfillment === 'delivery' ? (
                      <div><span>Fulfillment:</span> Delivery to {formData.area}{formData.directions && <p className="checkout-review-note">"{formData.directions}"</p>}</div>
                    ) : (
                      <div><span>Fulfillment:</span> Pickup at Lurambi Opp. Bamboo</div>
                    )}
                  </div>
                  <div className="checkout-review-box">
                    <p>M-Pesa Verification</p>
                    <p><span>Till Number:</span> {TILL_NUMBER}</p>
                    <div><span>Reference Code:</span><strong>{mpesaRef}</strong></div>
                  </div>
                </div>
                <div className="checkout-review-items">
                  <p>Items in Order</p>
                  {items.map(item => (
                    <div key={item.product.productId}>
                      <span>{item.product.name} × {item.quantity}</span>
                      <strong>KSh {(parseFloat(item.product.price) * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
                <div className="checkout-nav">
                  <button className="btn-primary" onClick={handleConfirm} disabled={submitting} style={{ minWidth: 180 }}>{submitting ? 'Placing Order...' : 'Place Order'}</button>
                  <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <h3>Order Overview</h3>
            <div className="checkout-sidebar-items">
              {items.map(item => (
                <div key={item.product.productId}>
                  <span>{item.product.name}</span>
                  <span>× {item.quantity}</span>
                  <strong>KSh {(parseFloat(item.product.price) * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <hr />
            <div><span>Subtotal</span><strong>KSh {total.toLocaleString()}</strong></div>
            <div><span>Delivery Fee</span><strong>{formData.fulfillment === 'delivery' ? (isFreeDelivery(total) ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`) : 'KSh 0'}</strong></div>
            <hr />
            <div className="checkout-sidebar-total"><strong>Total</strong><strong className="checkout-sidebar-grand">KSh {formData.fulfillment === 'delivery' ? grandTotal.toLocaleString() : total.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}