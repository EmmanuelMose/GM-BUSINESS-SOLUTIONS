
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-spinner" />
      <span className="loader-text">Loading...</span>
    </div>
  );
}