import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../productcard/ProductCard';
import Loader from '../loader/Loader';
import { categoriesAPI, type Category } from '../../Features/categories/categoriesAPI';
import { productsAPI, type Product } from '../../Features/products/productsAPI';
import './CategoryContent.css';

export default function CategoryContent() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cats = await categoriesAPI.getActive();
        const found = cats.data.find(c => c.slug === slug);
        if (found) setCategory(found);
        const prodRes = await productsAPI.getActive();
        if (prodRes.success) {
          const filtered = prodRes.data.filter(p => p.categoryId === found?.categoryId);
          setProducts(filtered);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  return (
    <div className="category-content">
      <div className="container">
        <div className="category-breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span className="current">{category?.name || 'Category'}</span>
        </div>
        <h1 className="category-title">{category?.name || 'Category'}</h1>
        <p className="category-count">{products.length} Results - Free delivery ≥ KSh 600 - Pickup ready in 1-2 hours</p>
        {loading ? <Loader />
          : products.length === 0 ? <div className="category-empty">No products in this category.</div>
          : <div className="category-grid">{products.map(p => <ProductCard key={p.productId} product={p} />)}</div>
        }
      </div>
    </div>
  );
}