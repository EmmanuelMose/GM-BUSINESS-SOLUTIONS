import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import './EditCategory.css';

export default function EditCategory() {
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
    icon: '',
    photo: '',
    parentId: '',
    displayOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, allCatsRes] = await Promise.all([
          categoriesAPI.getById(parseInt(id!)),
          categoriesAPI.getAll(),
        ]);
        if (catRes.success) {
          const c = catRes.data;
          setFormData({
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            icon: c.icon || '',
            photo: c.photo || '',
            parentId: String(c.parentId || ''),
            displayOrder: String(c.displayOrder || 0),
            isActive: c.isActive,
          });
        }
        if (allCatsRes.success) {
          setCategories(allCatsRes.data.filter(c => c.categoryId !== parseInt(id!)));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load category');
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
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        displayOrder: parseInt(formData.displayOrder),
      };
      const res = await categoriesAPI.update(parseInt(id!), payload);
      if (res.success) {
        setSuccess('Category updated successfully!');
        setTimeout(() => {
          navigate('/admin/categories');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading category...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Edit Category</h2>
        <button className="btn-secondary" onClick={() => navigate('/admin/categories')}>
          Back to Categories
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Category Name *</label>
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
            <label className="form-label">Icon (Emoji)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Photo URL</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Category</label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">None (Root Category)</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group full-width">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Category'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/categories')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}