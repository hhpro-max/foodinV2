import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import api from '../services/api';

const ProductGrid = ({ products, pagination, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  useEffect(() => {
    setCurrentPage(pagination.page);
  }, [pagination.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="product-grid">
      <div className="grid-container">
        {products.map(product => (
          <div key={product.id} className="grid-item">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline-primary" 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            className="btn btn-outline-primary" 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;