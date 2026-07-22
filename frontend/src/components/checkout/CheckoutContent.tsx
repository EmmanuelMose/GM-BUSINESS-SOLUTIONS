import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../../Features/orders/ordersAPI";
import { paymentsAPI } from "../../Features/payments/paymentsAPI";
import { pickupStationsAPI, type PickupStation, type PickupLocation } from "../../Features/pickupStations/pickupStationsAPI";
import "./CheckoutContent.css";

const STEPS = ["Details", "Pickup", "Payment"];

export default function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "" });
  const [stationId, setStationId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [stations, setStations] = useState<PickupStation[]>([]);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    pickupStationsAPI.getActive().then((res) => {
      if (res.success) setStations(res.data);
    });
  }, []);

  useEffect(() => {
    if (stationId) {
      pickupStationsAPI.getLocations(parseInt(stationId)).then((res) => {
        if (res.success) setLocations(res.data);
      });
    }
  }, [stationId]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = "Name required";
    if (!formData.phone.trim()) e.phone = "Phone required";
    if (!formData.email.trim()) e.email = "Email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!stationId) e.stationId = "Pickup station required";
    if (!locationId) e.locationId = "Pickup location required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateOrder = async () => {
    setSubmitting(true);
    setCheckoutStatus("");
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product.productId,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
        })),
        total: total,
        subtotal: total,
        tax: 0,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        billingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        deliveryNotes: "",
        guestEmail: formData.email,
        guestPhone: formData.phone,
        userId: null,
        pickupStationId: parseInt(stationId),
        pickupLocationId: parseInt(locationId),
      };
      const orderRes = await ordersAPI.create(payload);
      if (orderRes.success) {
        const order = orderRes.data;
        setOrderId(order.orderId);
        const paymentRes = await paymentsAPI.create({
          orderId: order.orderId,
          amount: total,
          paymentMethod: "mpesa",
          mpesaPhoneNumber: formData.phone,
        });
        if (paymentRes.success) {
          setPaymentId(paymentRes.data.paymentId);
          setStep(3);
          setCheckoutStatus("Payment initiated. Please check your phone for M-Pesa prompt.");
        } else {
          setCheckoutStatus("Failed to create payment record.");
        }
      } else {
        setCheckoutStatus("Order creation failed.");
      }
    } catch (error: any) {
      setCheckoutStatus(error.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitiateMpesa = async () => {
    if (!paymentId) return;
    setSubmitting(true);
    setCheckoutStatus("Initiating M-Pesa...");
    try {
      const res = await paymentsAPI.initiateMpesa(paymentId);
      if (res.success) {
        setCheckoutStatus("STK Push sent. Enter PIN on your phone.");
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const statusRes = await paymentsAPI.queryMpesaStatus(paymentId!);
          if (statusRes.success && statusRes.data.paymentStatus === "paid") {
            clearInterval(interval);
            setCheckoutStatus("Payment confirmed! Order placed.");
            clearCart();
            setTimeout(() => navigate("/"), 3000);
          } else if (attempts > 20) {
            clearInterval(interval);
            setCheckoutStatus("Payment timed out. Please try again.");
          }
        }, 5000);
      } else {
        setCheckoutStatus("Failed to initiate M-Pesa.");
      }
    } catch (error: any) {
      setCheckoutStatus(error.message || "Error initiating payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-content">
      <div className="container">
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <Link to="/cart">Cart</Link> <span>/</span> <span className="current">Checkout</span>
        </div>
        <div className="checkout-steps">
          {STEPS.map((label, i) => (
            <div key={label} className="checkout-step">
              <div className={`checkout-step-dot ${step > i + 1 ? "done" : ""} ${step === i + 1 ? "active" : ""}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`checkout-step-label ${step === i + 1 ? "active" : ""}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`checkout-step-line ${step > i + 1 ? "done" : ""}`} />}
            </div>
          ))}
        </div>
        <div className="checkout-grid">
          <div className="checkout-forms">
            {checkoutStatus && <div className="checkout-status">{checkoutStatus}</div>}
            {step === 1 && (
              <div className="checkout-card">
                <h2>Your Details</h2>
                <div className="checkout-field">
                  <label>Full Name</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div className="checkout-field">
                  <label>Phone (M-Pesa)</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="checkout-field">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2); }}>Continue</button>
              </div>
            )}
            {step === 2 && (
              <div className="checkout-card">
                <h2>Pickup Station</h2>
                <div className="checkout-field">
                  <label>Station</label>
                  <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
                    <option value="">Select station</option>
                    {stations.map((s) => (
                      <option key={s.stationId} value={s.stationId}>
                        {s.name} - {s.town}, {s.county}
                      </option>
                    ))}
                  </select>
                </div>
                {stationId && (
                  <div className="checkout-field">
                    <label>Location</label>
                    <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                      <option value="">Select location</option>
                      {locations.map((l) => (
                        <option key={l.locationId} value={l.locationId}>
                          {l.name} - {l.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="checkout-nav">
                  <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-primary" onClick={() => { if (validateStep2()) handleCreateOrder(); }} disabled={submitting}>
                    {submitting ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="checkout-card">
                <h2>Payment</h2>
                <p>Total: KSh {total.toLocaleString()}</p>
                <div className="checkout-field">
                  <label>Phone Number for M-Pesa</label>
                  <input type="tel" value={mpesaPhone || formData.phone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="0712345678" />
                </div>
                <button className="btn-primary" onClick={handleInitiateMpesa} disabled={submitting}>
                  {submitting ? "Sending STK Push..." : "Pay with M-Pesa"}
                </button>
                <div className="checkout-status">{checkoutStatus}</div>
              </div>
            )}
          </div>
          <div className="checkout-sidebar">
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item.product.productId}>
                <span>{item.product.name} × {item.quantity}</span>
                <strong>KSh {(parseFloat(item.product.price) * item.quantity).toLocaleString()}</strong>
              </div>
            ))}
            <hr />
            <div className="checkout-sidebar-total">
              <span>Total</span>
              <strong>KSh {total.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}