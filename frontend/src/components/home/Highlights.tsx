import { Shield, Award, Truck, Headphones } from 'lucide-react';
import './Highlights.css';

const HIGHLIGHTS = [
  { icon: Shield, label: '100% Genuine', desc: 'Authentic & quality products' },
  { icon: Award, label: 'Best Prices', desc: 'Unbeatable prices in Kenya' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Quick & reliable delivery' },
  { icon: Headphones, label: '24/7 Support', desc: 'We are here to help you' },
];

export default function Highlights() {
  return (
    <section className="highlights">
      <div className="container">
        <div className="highlights-grid">
          {HIGHLIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="highlights-item">
                <div className="highlights-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="highlights-label">{item.label}</h4>
                  <p className="highlights-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}