import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import './EditProduct.css';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    stock: '',
    lowStockThreshold: '5',
    categoryId: '',
    featuredPhoto: '',
    sku: '',
    brand: '',
    isFeatured: false,
    isBestSeller: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          productsAPI.getById(parseInt(id!)),
          categoriesAPI.getAll(),
        ]);
        if (productRes.success) {
          const p = productRes.data;
          setFormData({
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            price: p.price,
            comparePrice: p.comparePrice || '',
            stock: String(p.stock),
            lowStockThreshold: String(p.lowStockThreshold || 5),
            categoryId: String(p.categoryId || ''),
            featuredPhoto: p.featuredPhoto || '',
            sku: p.sku || '',
            brand: p.brand || '',
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
          });
        }
        if (categoriesRes.success) setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        comparePrice: formData.comparePrice ? formData.comparePrice : null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };
      const res = await productsAPI.update(parseInt(id!), payload);
      if (res.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading product...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Edit Product</h2>
        <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
          Back to Products
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price (KSh) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Compare Price</label>
            <input
              type="number"
              name="comparePrice"
              value={formData.comparePrice}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-input"
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Low Stock Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Featured Photo URL</label>
            <input
              type="url"
              name="featuredPhoto"
              value={formData.featuredPhoto}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Short Description</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="form-textarea"
              rows={2}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows={4}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              Featured Product
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
              />
              Best Seller
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}