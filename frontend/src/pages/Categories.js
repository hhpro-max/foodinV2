import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { getCategories } from '../services/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
  const response = await getCategories();
  console.log('Categories API response:', response);

  // Backend may return different shapes. Support common variants:
        // - Array
        // - { categories: [...] }
        // - { status: 'success', data: { categories: [...] } }
        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response.categories)) {
          list = response.categories;
        } else if (response.data && Array.isArray(response.data.categories)) {
          list = response.data.categories;
        } else if (response.data && Array.isArray(response.data)) {
          list = response.data;
        } else {
          // fallback: try to find any array value in response
          const arr = Object.values(response).find((v) => Array.isArray(v));
          if (Array.isArray(arr)) list = arr;
        }

        setCategories(list);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="categories-page">
        <div className="container">
          <div className="page-header">
            <h1>Categories</h1>
          </div>
          <div className="categories-grid">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="category-card-skeleton">
                <Skeleton height={200} />
                <Skeleton height={20} width="60%" />
                <Skeleton height={16} width="40%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">
        <div className="page-header">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          <h1>All Categories</h1>
          <p>Browse products by category</p>
        </div>

        {error ? (
          <div className="empty-categories">
            <h3>Error loading categories</h3>
            <p>{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-categories">
            <FaShoppingBag />
            <h3>No categories found</h3>
            <p>There are no categories available at the moment.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="category-card"
              >
                <div className="category-icon">
                  <FaShoppingBag />
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.description || 'No description available'}</p>
                </div>
                <div className="category-arrow">
                  <FaArrowLeft />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 