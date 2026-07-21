import { useState, useEffect } from 'react';
import CategoryCard from '../categorycard/CategoryCard';
import { categoriesAPI, type Category } from '../../Features/categories/categoriesAPI';
import './Categories.css';

const DEFAULT_CATEGORIES: Category[] = [
  {
    categoryId: 1, name: 'Phones', slug: 'phones', description: 'Smartphones & accessories', photo: null, icon: '📱',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    categoryId: 2, name: 'Laptops & Computers', slug: 'laptops-computers', description: 'Work & gaming', photo: null, icon: '💻',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    categoryId: 3, name: 'TVs & Displays', slug: 'tvs-displays', description: '4K, smart TVs', photo: null, icon: '📺',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    categoryId: 4, name: 'Audio', slug: 'audio', description: 'Speakers & earphones', photo: null, icon: '🎧',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    categoryId: 5, name: 'Solar', slug: 'solar', description: 'Panels, inverters', photo: null, icon: '☀️',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    categoryId: 6, name: 'Home Appliances', slug: 'home-appliances', description: 'Kitchen & home', photo: null, icon: '🏠',
    parentId: null,
    displayOrder: null,
    isActive: false,
    createdAt: '',
    updatedAt: ''
  },
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    categoriesAPI.getActive().then(res => {
      if (res.success && res.data.length) setCategories(res.data);
    }).catch(console.error);
  }, []);

  return (
    <section className="categories-section">
      <div className="container">
        <div className="categories-header">
          <h2 className="categories-title">Shop by Category</h2>
          <p className="categories-sub">Explore our wide selection of inventory categories.</p>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 6).map(cat => <CategoryCard key={cat.categoryId} category={cat} />)}
        </div>
      </div>
    </section>
  );
}