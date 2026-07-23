import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import './Categories.css';

export default function StaffCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoriesAPI.getAll();
        if (res.success) setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setDeleting(id);
    try {
      const res = await categoriesAPI.delete(id);
      if (res.success) {
        setCategories(categories.filter(c => c.categoryId !== id));
      } else {
        alert('Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading categories</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Categories</h2>
        <Link to="/staff/categories/create" className="btn-primary">
          <Plus size={18} /> Add Category
        </Link>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.categoryId}>
                  <td className="category-name">
                    {category.icon && <span className="category-icon">{category.icon}</span>}
                    {category.name}
                  </td>
                  <td className="category-slug">{category.slug}</td>
                  <td className="category-products">{category.productCount || 0}</td>
                  <td>
                    <span className={`status-badge ${category.isActive ? 'status-active' : 'status-inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/staff/categories/edit/${category.categoryId}`} className="action-btn edit" title="Edit Category">
                      <Edit size={16} />
                    </Link>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(category.categoryId)}
                      disabled={deleting === category.categoryId}
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}