import React, { useState, useEffect } from 'react';
import { getPendingProducts, approveProduct, rejectProduct } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getPendingProducts();
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error('Failed to fetch pending products.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      toast.success('Product approved successfully.');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to approve product.');
      console.error(error);
    }
  };

  const handleReject = async (productId) => {
    try {
      await rejectProduct(productId);
      toast.success('Product rejected successfully.');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to reject product.');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Product Management</h2>
      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.status}</td>
              <td>
                <button onClick={() => handleApprove(product.id)}>Approve</button>
                <button onClick={() => handleReject(product.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;