import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import CloudinaryUpload from '../../../../components/CloudinaryUpload';
import './CreateCategory.css';

export default function CreateCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    photo: null as File | null,
    parentId: '',
    displayOrder: '0',
    isActive: true,
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
    setFormData({ ...formData, photo: file });
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: null });
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
      formDataToSend.append('icon', formData.icon || '');
      formDataToSend.append('parentId', formData.parentId || '');
      formDataToSend.append('displayOrder', formData.displayOrder);
      formDataToSend.append('isActive', String(formData.isActive));
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const res = await categoriesAPI.create(formDataToSend);
      if (res.success) {
        setSuccess('Category created successfully!');
        setTimeout(() => navigate('/admin/categories'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="back-btn" onClick={() => navigate('/admin/categories')}>
            <ArrowLeft size={18} /> Back to Categories
          </button>
          <h2>Create New Category</h2>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Category Name <span className="required">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required placeholder="e.g., Electronics" />
          </div>

          <div className="form-group">
            <label className="form-label">Slug <span className="required">*</span></label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="form-input" required placeholder="e.g., electronics" />
          </div>

          <div className="form-group">
            <label className="form-label">Icon (Emoji)</label>
            <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="form-input" placeholder="📱" />
          </div>

          <div className="form-group">
            <label className="form-label">Category Image</label>
            <CloudinaryUpload
              onUpload={handlePhotoUpload}
              onRemove={handleRemovePhoto}
              currentImage={null}
              label="Upload Category Image"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category</label>
            <select name="parentId" value={formData.parentId} onChange={handleChange} className="form-select">
              <option value="">None (Root Category)</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} className="form-input" min="0" placeholder="0" />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={3} placeholder="Brief description of the category" />
          </div>

          <div className="form-group checkbox-group full-width">
            <label className="form-checkbox">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Active
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : <><Plus size={18} /> Create Category</>}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/categories')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}