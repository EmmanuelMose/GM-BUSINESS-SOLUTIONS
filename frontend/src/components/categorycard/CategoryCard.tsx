
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '../../Features/categories/categoriesAPI';
import './CategoryCard.css';

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/category/${category.slug}`} className="category-card">
      <div className="category-card-image-wrap">
        {category.photo ? <img src={category.photo} alt={category.name} className="category-card-image" /> : <div className="category-card-placeholder"><span className="category-card-placeholder-text">{category.icon || '📁'}</span></div>}
      </div>
      <div className="category-card-content">
        <p className="category-card-name">{category.name}</p>
        {category.description && <p className="category-card-desc">{category.description}</p>}
        <div className="category-card-footer">
          <span>{category.productCount ?? 0} Products</span>
          <ArrowRight size={12} className="category-card-arrow" />
        </div>
      </div>
    </Link>
  );
}