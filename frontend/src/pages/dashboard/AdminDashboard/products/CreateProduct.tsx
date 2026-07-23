import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, } from 'lucide-react';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import CloudinaryUpload from '../../../../components/CloudinaryUpload';
import './CreateProduct.css';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    featuredPhoto: null as File | null,
    sku: '',
    brand: '',
    isFeatured: false,
    isBestSeller: false,
  });

  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = (file: File) => {
    setFormData({ ...formData, featuredPhoto: file });
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, featuredPhoto: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('shortDescription', formData.shortDescription || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('comparePrice', formData.comparePrice || '');
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('lowStockThreshold', formData.lowStockThreshold);
      formDataToSend.append('categoryId', formData.categoryId || '');
      formDataToSend.append('sku', formData.sku || '');
      formDataToSend.append('brand', formData.brand || '');
      formDataToSend.append('isFeatured', String(formData.isFeatured));
      formDataToSend.append('isBestSeller', String(formData.isBestSeller));
      if (formData.featuredPhoto) {
        formDataToSend.append('featuredPhoto', formData.featuredPhoto);
      }

      const res = await productsAPI.create(formDataToSend);
      if (res.success) {
        setSuccess('Product created successfully!');
        setTimeout(() => navigate('/admin/products'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/admin/products')}>
            <ArrowLeft size={18} /> Back to Products
          </button>
          <h2>Create New Product</h2>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name <span className="required">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required placeholder="e.g., iPhone 15 Pro Max" />
          </div>

          <div className="form-group">
            <label className="form-label">Slug <span className="required">*</span></label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input" required placeholder="e.g., iphone-15-pro-max" />
          </div>

          <div className="form-group">
            <label className="form-label">Category <span className="required">*</span></label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="form-select" required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="form-input" placeholder="e.g., Apple, Samsung" />
          </div>

          <div className="form-group">
            <label className="form-label">Price (KSh) <span className="required">*</span></label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" required min="0" step="0.01" placeholder="0.00" />
          </div>

          <div className="form-group">
            <label className="form-label">Compare Price</label>
            <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleChange} className="form-input" min="0" step="0.01" placeholder="0.00" />
          </div>

          <div className="form-group">
            <label className="form-label">Stock <span className="required">*</span></label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="form-input" required min="0" placeholder="0" />
          </div>

          <div className="form-group">
            <label className="form-label">Low Stock Threshold</label>
            <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="form-input" min="0" placeholder="5" />
          </div>

          <div className="form-group">
            <label className="form-label">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="form-input" placeholder="e.g., IPH15PM256" />
          </div>

          <div className="form-group">
            <label className="form-label">Featured Photo</label>
            <CloudinaryUpload
              onUpload={handlePhotoUpload}
              onRemove={handleRemovePhoto}
              currentImage={null}
              label="Upload Featured Image"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Short Description</label>
            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="form-textarea" rows={2} placeholder="Brief product summary" />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={4} placeholder="Detailed product description" />
          </div>

          <div className="form-group checkbox-group">
            <label className="form-checkbox">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
              Featured Product
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="form-checkbox">
              <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
              Best Seller
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : <><Plus size={18} /> Create Product</>}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}