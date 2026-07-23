import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, type Category } from '../../../../Features/categories/categoriesAPI';
import './Categories.css';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  };

  if (loading) {
    return <div className="page-loading">Loading categories...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Categories</h2>
        <Link to="/admin/categories/create" className="btn-primary">Add Category</Link>
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
              <tr><td colSpan={5} className="empty-state">No categories found</td></tr>
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
                    <Link to={`/admin/categories/edit/${category.categoryId}`} className="action-btn edit">✏️</Link>
                    <button className="action-btn delete" onClick={() => handleDelete(category.categoryId)}>🗑️</button>
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