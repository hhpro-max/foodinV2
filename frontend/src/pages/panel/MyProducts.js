import React, { useState, useEffect } from 'react';
import { getSellerProducts } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getSellerProducts();
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error('Failed to fetch your products.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>My Products</h2>
      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.status}</td>
              <td>{product.sale_price}</td>
              <td>{product.stock_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyProducts;