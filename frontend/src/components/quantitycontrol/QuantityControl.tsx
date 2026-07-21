
import './QuantityControl.css';

export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  size = 'md',
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'md';
}) {
  const btnClass = size === 'sm' ? 'qty-btn-sm' : 'qty-btn-md';
  const valClass = size === 'sm' ? 'qty-value-sm' : 'qty-value-md';

  return (
    <div className="qty-control">
      <button className={`qty-btn ${btnClass}`} onClick={onDecrease} aria-label="Decrease quantity">−</button>
      <span className={`qty-value ${valClass}`}>{quantity}</span>
      <button className={`qty-btn ${btnClass}`} onClick={onIncrease} aria-label="Increase quantity">+</button>
    </div>
  );
}