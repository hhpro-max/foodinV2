import React, { useState, useEffect } from 'react';
import {
  getAllProductsAdmin,
  deleteProduct,
  updateProductStock
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const navigate = useNavigate();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      const res = await getAllProductsAdmin(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to fetch products.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      search: ''
    });
    fetchProducts(1);
  };

  const handleEditProduct = (productId) => {
    navigate(`/panel/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts(currentPage);
      } catch (error) {
        toast.error('Failed to delete product');
        console.error(error);
      }
    }
  };

  const handleUpdateStock = async (productId) => {
    const input = prompt('Enter stock adjustment (use + to add, - to subtract):');
    if (input === null) return;
    
    let operation, quantity;
    if (input.startsWith('+')) {
      operation = 'add';
      quantity = parseFloat(input.substring(1));
    } else if (input.startsWith('-')) {
      operation = 'subtract';
      quantity = parseFloat(input.substring(1));
    } else {
      alert('Please enter a valid adjustment starting with + or -');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid number greater than 0');
      return;
    }

    try {
      await updateProductStock(productId, { quantity, operation });
      toast.success('Stock updated successfully');
      fetchProducts(currentPage);
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge active';
      case 'pending':
        return 'status-badge pending';
      case 'rejected':
        return 'status-badge inactive';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="panel-content-wrapper">
      <div className="panel-header">
        <h2>All Products (Admin)</h2>
      </div>

      <div className="panel-filters">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="filter-group">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Product name..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="action-button edit-button">
              Apply Filters
            </button>
            <button
              type="button"
              className="action-button"
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="no-data">
          <p>No products found.</p>
        </div>
      ) : (
        <>
          <table className="panel-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-thumbnail">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url.startsWith('http')
                            ? product.images[0].url
                            : `http://localhost:3000${product.images[0].url}`}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <img src="https://via.placeholder.com/50x50?text=No+Image" alt="No image" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>
                    <span className={getStatusBadgeClass(product.status)}>
                      {product.status}
                    </span>
                  </td>
                  <td>{product.salePrice ? `$${product.salePrice.toFixed(2)}` : 'N/A'}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.seller?.name || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button stock-button"
                        onClick={() => handleUpdateStock(product.id)}
                      >
                        Stock
                      </button>
                      <button
                        className="action-button deactivate-button"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="action-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                className="action-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;