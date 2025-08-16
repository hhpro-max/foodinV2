import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../../services/api';

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await getProduct(id);
        if (!mounted) return;
        setProduct(resp);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Price: {product.purchasePrice ?? product.salePrice}</p>
      <p>Status: {product.status}</p>
    </div>
  );
};

export default ProductView;
