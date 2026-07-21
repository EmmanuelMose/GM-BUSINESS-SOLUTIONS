import './Highlights.css';

const HIGHLIGHTS = [
  { label: 'Genuine Products', desc: '100% authentic devices & wiring from top brands.' },
  { label: 'Affordable Prices', desc: "Kakamega's most competitive rates on all stock." },
  { label: 'Wide Variety', desc: 'From small bulb holders to smart TVs & panels.' },
  { label: 'Convenient Delivery', desc: 'Same-day Kakamega delivery for orders ≥ KSh 600.' },
  { label: 'Customer Support', desc: 'Dedicated helpline for enquiries and support.' },
];

export default function Highlights() {
  return (
    <section className="highlights">
      <div className="container">
        <div className="highlights-grid">
          {HIGHLIGHTS.map((item, i) => (
            <div key={i} className="highlights-item">
              <div className="highlights-icon">✦</div>
              <div>
                <h4 className="highlights-label">{item.label}</h4>
                <p className="highlights-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}