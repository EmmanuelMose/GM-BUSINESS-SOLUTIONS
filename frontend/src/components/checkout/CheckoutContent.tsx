import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Phone, Mail, CheckCircle, User, Store, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../../Features/orders/ordersAPI";
import { paymentsAPI } from "../../Features/payments/paymentsAPI";
import { pickupStationsAPI, type PickupStation, type PickupLocation } from "../../Features/pickupStations/pickupStationsAPI";
import "./CheckoutContent.css";

const STEPS = [
  { id: 1, label: "Details", icon: "📋" },
  { id: 2, label: "Pickup", icon: "📍" },
  { id: 3, label: "Payment", icon: "💳" },
];

export default function CheckoutContent() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "" });
  const [stationId, setStationId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [stations, setStations] = useState<PickupStation[]>([]);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    setLoadingStations(true);
    pickupStationsAPI.getActive().then((res) => {
      if (res.success) setStations(res.data);
      setLoadingStations(false);
    });
  }, []);

  useEffect(() => {
    if (stationId) {
      pickupStationsAPI.getLocations(parseInt(stationId)).then((res) => {
        if (res.success) setLocations(res.data);
        else setLocations([]);
      });
    } else {
      setLocations([]);
    }
  }, [stationId]);

  const validateStep = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName.trim()) e.fullName = "Full name is required";
      if (!formData.phone.trim()) e.phone = "Phone number is required";
      if (!formData.email.trim()) e.email = "Email is required";
    } else if (step === 2) {
      if (!stationId) e.stationId = "Please select a pickup station";
      if (!locationId) e.locationId = "Please select a pickup location";
    } else if (step === 3) {
      if (!mpesaPhone.trim()) e.mpesaPhone = "Phone number is required";
      else if (!/^[0-9]{10,12}$/.test(mpesaPhone.replace(/\D/g, ""))) e.mpesaPhone = "Invalid phone number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreateOrder = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setPaymentStatus("Creating order...");
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product.productId,
          quantity: item.quantity,
          price: parseFloat(item.product.price),
          productName: item.product.name,
          productSku: item.product.sku || undefined,
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
        pickupStationId: stationId ? parseInt(stationId) : null,
        pickupLocationId: locationId ? parseInt(locationId) : null,
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
          setCurrentStep(3);
          setPaymentStatus("Payment initiated. Please check your phone for M-Pesa prompt.");
        } else {
          setPaymentStatus("Failed to create payment record.");
        }
      } else {
        setPaymentStatus(orderRes.message || "Order creation failed.");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      setPaymentStatus(error.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitiateMpesa = async () => {
    if (!paymentId) return;
    if (!validateStep(3)) return;
    setSubmitting(true);
    setPaymentStatus("Initiating M-Pesa...");
    try {
      const res = await paymentsAPI.initiateMpesa(paymentId);
      if (res.success) {
        setPaymentStatus("STK Push sent. Enter PIN on your phone.");
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const statusRes = await paymentsAPI.queryMpesaStatus(paymentId!);
          if (statusRes.success && statusRes.data.paymentStatus === "paid") {
            clearInterval(interval);
            setPaymentStatus("Payment confirmed! Order placed.");
            setOrderComplete(true);
            clearCart();
            setTimeout(() => navigate("/"), 4000);
          } else if (attempts > 20) {
            clearInterval(interval);
            setPaymentStatus("Payment timed out. Please try again.");
          }
        }, 5000);
      } else {
        setPaymentStatus("Failed to initiate M-Pesa.");
      }
    } catch (error: any) {
      setPaymentStatus(error.message || "Error initiating payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStation = stations.find((s) => s.stationId === parseInt(stationId));
  const selectedLocation = locations.find((l) => l.locationId === parseInt(locationId));

  return (
    <div className="checkout-content">
      <div className="container">
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <Link to="/cart">Cart</Link> <span>/</span> <span className="current">Checkout</span>
        </div>

        {orderComplete ? (
          <div className="checkout-success">
            <div className="checkout-success-icon"><CheckCircle size={64} /></div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order has been confirmed. You will receive a confirmation email shortly.</p>
            <p>Pickup Station: <strong>{selectedStation?.name}</strong></p>
            <p>Location: <strong>{selectedLocation?.name}</strong></p>
            <Link to="/" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="checkout-steps">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="checkout-step">
                  <div className={`checkout-step-dot ${currentStep === step.id ? "active" : ""} ${currentStep > step.id ? "done" : ""}`}>
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className={`checkout-step-label ${currentStep === step.id ? "active" : ""}`}>
                    {step.icon} {step.label}
                  </span>
                  {idx < STEPS.length - 1 && <div className={`checkout-step-line ${currentStep > step.id ? "done" : ""}`} />}
                </div>
              ))}
            </div>

            <div className="checkout-grid">
              <div className="checkout-forms">
                {currentStep === 1 && (
                  <div className="checkout-card fade-in">
                    <h2 className="checkout-card-title">Contact Details</h2>
                    <p className="checkout-card-sub">We'll use this to confirm your order.</p>
                    <div className="checkout-field">
                      <label className="checkout-label"><Mail size={16} /> Email</label>
                      <input
                        type="email"
                        className={`checkout-input ${errors.email ? "error" : ""}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                      {errors.email && <span className="checkout-error-text">{errors.email}</span>}
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-label"><Phone size={16} /> Phone (M-Pesa)</label>
                      <input
                        type="tel"
                        className={`checkout-input ${errors.phone ? "error" : ""}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0712345678"
                      />
                      {errors.phone && <span className="checkout-error-text">{errors.phone}</span>}
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-label"><User size={16} /> Full Name</label>
                      <input
                        type="text"
                        className={`checkout-input ${errors.fullName ? "error" : ""}`}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                      {errors.fullName && <span className="checkout-error-text">{errors.fullName}</span>}
                    </div>
                    <button className="btn-primary checkout-next" onClick={handleNext}>
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="checkout-card fade-in">
                    <h2 className="checkout-card-title"><Store size={20} /> Pickup Station</h2>
                    <p className="checkout-card-sub">Select the station where you want to pick up your order.</p>
                    {loadingStations ? (
                      <div className="checkout-loading">Loading stations...</div>
                    ) : (
                      <>
                        <div className="checkout-field">
                          <label className="checkout-label">Station</label>
                          <div className="checkout-select-wrapper">
                            <select
                              className={`checkout-select ${errors.stationId ? "error" : ""}`}
                              value={stationId}
                              onChange={(e) => setStationId(e.target.value)}
                            >
                              <option value="">Select a station</option>
                              {stations.map((s) => (
                                <option key={s.stationId} value={s.stationId}>
                                  {s.name} - {s.town}, {s.county}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="checkout-select-arrow" size={18} />
                          </div>
                          {errors.stationId && <span className="checkout-error-text">{errors.stationId}</span>}
                        </div>
                        {stationId && (
                          <div className="checkout-field">
                            <label className="checkout-label">Pickup Location</label>
                            <div className="checkout-select-wrapper">
                              <select
                                className={`checkout-select ${errors.locationId ? "error" : ""}`}
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                              >
                                <option value="">Select a location</option>
                                {locations.map((l) => (
                                  <option key={l.locationId} value={l.locationId}>
                                    {l.name} - {l.address}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="checkout-select-arrow" size={18} />
                            </div>
                            {errors.locationId && <span className="checkout-error-text">{errors.locationId}</span>}
                          </div>
                        )}
                        {stationId && selectedStation && (
                          <div className="checkout-station-info">
                            <div className="checkout-station-info-icon">📍</div>
                            <div>
                              <p className="checkout-station-info-name">{selectedStation.name}</p>
                              <p className="checkout-station-info-address">{selectedStation.address}</p>
                              <p className="checkout-station-info-phone">📞 {selectedStation.phone || "N/A"}</p>
                            </div>
                          </div>
                        )}
                        <div className="checkout-nav">
                          <button className="btn-secondary" onClick={handleBack}>
                            <ChevronLeft size={18} /> Back
                          </button>
                          <button className="btn-primary" onClick={handleCreateOrder} disabled={submitting}>
                            {submitting ? "Processing..." : "Proceed to Payment"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="checkout-card fade-in">
                    <h2 className="checkout-card-title">Payment</h2>
                    <p className="checkout-card-sub">Complete payment via M-Pesa STK Push.</p>
                    <div className="checkout-payment-info">
                      <p>Total: <strong>KSh {total.toLocaleString()}</strong></p>
                      <p>Pickup: <strong>{selectedStation?.name}</strong></p>
                    </div>
                    <div className="checkout-field">
                      <label className="checkout-label">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        className={`checkout-input ${errors.mpesaPhone ? "error" : ""}`}
                        value={mpesaPhone || formData.phone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="0712345678"
                      />
                      {errors.mpesaPhone && <span className="checkout-error-text">{errors.mpesaPhone}</span>}
                    </div>
                    <button
                      className="btn-primary checkout-pay"
                      onClick={handleInitiateMpesa}
                      disabled={submitting}
                    >
                      {submitting ? "Sending STK Push..." : "Pay with M-Pesa"}
                    </button>
                    {paymentStatus && (
                      <div className={`checkout-status ${paymentStatus.includes("confirmed") ? "success" : ""}`}>
                        {paymentStatus}
                      </div>
                    )}
                    <div className="checkout-nav">
                      <button className="btn-secondary" onClick={handleBack}>
                        <ChevronLeft size={18} /> Back
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="checkout-sidebar">
                <h3>Order Summary</h3>
                <div className="checkout-sidebar-items">
                  {items.map((item) => (
                    <div key={item.product.productId}>
                      <span>{item.product.name} × {item.quantity}</span>
                      <strong>KSh {(parseFloat(item.product.price) * item.quantity).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="checkout-sidebar-total">
                  <span>Total</span>
                  <strong>KSh {total.toLocaleString()}</strong>
                </div>
                <div className="checkout-sidebar-pickup">
                  <MapPin size={16} />
                  {selectedStation ? (
                    <span>Pickup: {selectedStation.name}</span>
                  ) : (
                    <span>Select a pickup station</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}