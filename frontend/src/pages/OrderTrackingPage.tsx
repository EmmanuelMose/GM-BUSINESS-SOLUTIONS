import { useState } from "react";
import Layout from "../components/layout/Layout";
import { ordersAPI } from "../Features/orders/ordersAPI";
import "./OrderTracking.css";

export default function OrderTrackingPage() {
  const [ref, setRef] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await ordersAPI.getByRef(ref.trim());
      if (res.success) {
        setOrder(res.data);
      } else {
        setError("Order not found");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching order");
    } finally {
      setLoading(false);
    }
  };

  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIndex = order ? statuses.indexOf(order.status) : -1;

  return (
    <Layout>
      <div className="tracking-page">
        <div className="container">
          <h1>Order Tracking</h1>
          <div className="tracking-input">
            <input type="text" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Enter order reference (e.g., NJ-2026-0001)" />
            <button onClick={handleTrack} disabled={loading}>{loading ? "Tracking..." : "Track"}</button>
          </div>
          {error && <div className="tracking-error">{error}</div>}
          {order && (
            <div className="tracking-details">
              <h2>Order {order.orderRef}</h2>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Total: KSh {parseFloat(order.total).toLocaleString()}</p>
              <div className="tracking-progress">
                {statuses.map((s, idx) => (
                  <div key={s} className={`step ${idx <= currentIndex ? "active" : ""}`}>
                    <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    {idx < statuses.length - 1 && <div className={`line ${idx < currentIndex ? "active" : ""}`} />}
                  </div>
                ))}
              </div>
              <p>Pickup Station: {order.pickupStationId ? "Selected" : "Not set"}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}