import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FulfillmentModule.css';

export const FREE_DELIVERY_THRESHOLD = 600;
const DELIVERY_CUTOFF_HOUR = 16;
const SATURDAY = 6;
export const STORE_LOCATION = 'Kakamega, Lurambi, Opposite Bamboo';

function getNow() { return new Date(); }

function isPickupOpen(now: Date = getNow()): boolean {
  const d = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  if (d === SATURDAY) return false;
  if (d >= 0 && d <= 4) return h >= 8.5 && h < 20;
  if (d === 5) return h >= 8.5 && h < 15;
  return false;
}

function isDeliveryOpen(now: Date = getNow()): boolean {
  const d = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  if (d === SATURDAY) return false;
  if (d >= 0 && d <= 4) return h >= 8.5 && h < 16;
  if (d === 5) return h >= 8.5 && h < 15;
  return false;
}

function formatDeliveryMessage(now: Date = getNow()): string {
  const d = now.getDay();
  const hour = now.getHours();
  if (d === SATURDAY) return "We're closed on Saturdays. Delivery resumes Sunday 8:30am-4:00pm.";
  if (!isDeliveryOpen(now)) return 'Delivery hours are 8:30am-4:00pm (Sun-Thu) and 8:30am-3:00pm (Fri).';
  if (hour < DELIVERY_CUTOFF_HOUR) return 'Order before 4:00pm for same-day delivery.';
  return 'Orders after 4:00pm are delivered the next day.';
}

function formatPickupMessage(now: Date = getNow()): string {
  const d = now.getDay();
  if (d === SATURDAY) return 'Pickup is unavailable on Saturdays. Shop opens Sunday 8:30am. Your order will be ready 1-2 hours after opening.';
  if (isPickupOpen(now)) return 'Ready for pickup in 1-2 hours.';
  return "We're currently closed. Your order will be ready 1-2 hours after we open.";
}

export function isFreeDelivery(subtotal: number): boolean {
  return subtotal >= FREE_DELIVERY_THRESHOLD;
}

export function getDeliveryFee(subtotal: number): number {
  return isFreeDelivery(subtotal) ? 0 : 150;
}

export function formatDeliveryMessageForExport(now: Date = getNow()): string {
  return formatDeliveryMessage(now);
}

export function formatPickupMessageForExport(now: Date = getNow()): string {
  return formatPickupMessage(now);
}

export default function FulfillmentModule({ subtotal, showPanels = true }: { subtotal: number; showPanels?: boolean }) {
  const [tab, setTab] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [pickupMsg, setPickupMsg] = useState('');

  useEffect(() => {
    setDeliveryMsg(formatDeliveryMessage());
    setPickupMsg(formatPickupMessage());
    const interval = setInterval(() => {
      setDeliveryMsg(formatDeliveryMessage());
      setPickupMsg(formatPickupMessage());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const freeDelivery = isFreeDelivery(subtotal);

  return (
    <div className="fulfillment-container">
      {showPanels && (
        <div className="fulfillment-tabs">
          <button className={`fulfillment-tab ${tab === 'delivery' ? 'fulfillment-tab-active' : ''}`} onClick={() => setTab('delivery')}>Delivery</button>
          <button className={`fulfillment-tab ${tab === 'pickup' ? 'fulfillment-tab-active' : ''}`} onClick={() => setTab('pickup')}>Pickup</button>
        </div>
      )}
      {(!showPanels || tab === 'delivery') && (
        <div>
          <p className="fulfillment-text">{freeDelivery ? <>Delivery: <strong>Free</strong> (orders ≥ KSh {FREE_DELIVERY_THRESHOLD})</> : <>Delivery: <span>Free from KSh {FREE_DELIVERY_THRESHOLD} (Current Fee: KSh 150)</span></>}</p>
          {showPanels && (
            <>
              <p className="fulfillment-text">{deliveryMsg}</p>
              <p className="fulfillment-text">Delivery: <strong>Sunday-Friday</strong>, <strong>8:30am-4:00pm</strong>. Closed <strong>Saturday</strong>.</p>
              <Link to="/account?tab=policy" className="fulfillment-link">Delivery & Pickup details</Link>
            </>
          )}
        </div>
      )}
      {showPanels && tab === 'pickup' && (
        <div>
          <p className="fulfillment-text">Pickup point: <strong>{STORE_LOCATION}</strong></p>
          <p className="fulfillment-text">{pickupMsg}</p>
          <p className="fulfillment-text">Shop hours: <strong>Sun-Thu 8:30am-8:00pm</strong> - <strong>Fri 8:30am-3:00pm</strong>. Closed <strong>Saturday</strong>.</p>
          <Link to="/account?tab=location" className="fulfillment-link">View store location</Link>
        </div>
      )}
    </div>
  );
}