import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, type Product } from '../../../../Features/products/productsAPI';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getAll();
        if (res.success) setProducts(res.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await productsAPI.delete(id);
      if (res.success) {
        setProducts(products.filter(p => p.productId !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="page-loading">Loading products...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Products</h2>
        <div className="page-actions">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <Link to="/admin/products/create" className="btn-primary">Add Product</Link>
        </div>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No products found</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="product-name">{product.name}</td>
                  <td className="product-sku">{product.sku || 'N/A'}</td>
                  <td className="product-price">KSh {parseFloat(product.price).toLocaleString()}</td>
                  <td className="product-stock">{product.stock}</td>
                  <td>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/admin/products/edit/${product.productId}`} className="action-btn edit">✏️</Link>
                    <button className="action-btn delete" onClick={() => handleDelete(product.productId)}>🗑️</button>
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