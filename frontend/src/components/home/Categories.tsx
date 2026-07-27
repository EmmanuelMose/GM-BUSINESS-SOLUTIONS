import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, type Category } from '../../Features/categories/categoriesAPI';
import './Categories.css';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data.length > 0) {
          setCategories(res.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="categories-header">
            <h2 className="categories-title">Shop by Category</h2>
            <p className="categories-sub">Loading categories...</p>
          </div>
          <div className="categories-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="category-card skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text small"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="categories-header">
            <h2 className="categories-title">Shop by Category</h2>
            <p className="categories-sub">No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-header">
          <h2 className="categories-title">Shop by Category</h2>
          <p className="categories-sub">Explore our wide selection of products</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat.categoryId} to={`/category/${cat.slug}`} className="category-card">
              <div className="category-card-image-wrapper">
                {cat.photo ? (
                  <img src={cat.photo} alt={cat.name} className="category-card-image" />
                ) : (
                  <div className="category-card-icon">{cat.icon || '📁'}</div>
                )}
              </div>
              <h3 className="category-card-name">{cat.name}</h3>
              <p className="category-card-count">{cat.productCount || 0} Products</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}