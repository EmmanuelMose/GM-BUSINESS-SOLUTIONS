import { useState, useEffect } from 'react';
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
          <button className="btn-primary">Add Product</button>
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
              <tr>
                <td colSpan={6} className="empty-state">No products found</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="product-name">{product.name}</td>
                  <td>{product.sku || 'N/A'}</td>
                  <td className="product-price">KSh {parseFloat(product.price).toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
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