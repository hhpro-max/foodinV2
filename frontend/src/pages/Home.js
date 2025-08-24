import React, { useState, useEffect } from 'react';
import { debounce } from '../utils/debounce';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import TagCloud from '../components/TagCloud';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getCategories } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');
        
        // Test if backend is reachable
        try {
          const testResponse = await fetch('http://localhost:3000/api/v1/products');
          console.log('Backend test response status:', testResponse.status);
          const testData = await testResponse.json();
          console.log('Backend test data:', testData);
        } catch (testError) {
          console.error('Backend test failed:', testError);
        }
        
        // Fetch categories
        const categoriesResponse = await getCategories();
        console.log('Categories response:', categoriesResponse);
        setCategories(categoriesResponse.categories || []);

        // Fetch products
        await fetchProducts();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch products with current filters
  const fetchProducts = async (page = 1) => {
    const params = {
      page,
      limit: pagination.limit,
      search: searchQuery,
      category_id: selectedCategory,
      tags: selectedTags.join(',')
    };

    console.log('Fetching products with params:', params);

    try {
      // First, let's test with a direct fetch to see the exact response
      const directResponse = await fetch('http://localhost:3000/api/v1/products');
      const directData = await directResponse.json();
      console.log('Direct fetch response:', directData);
      console.log('Direct fetch data structure:', {
        status: directData.status,
        hasData: !!directData.data,
        dataType: typeof directData.data,
        hasProducts: !!directData.data?.products,
        productsLength: directData.data?.products?.length,
        productsType: typeof directData.data?.products
      });

      // Now try with our API service
      const response = await getProducts(params);
      console.log('API service response:', response);
      console.log('API service response structure:', {
        hasProducts: !!response.products,
        productsLength: response.products?.length,
        productsType: typeof response.products,
        hasPagination: !!response.pagination
      });
      
      // Fix: The API service already returns the data part, so access directly
      const productsData = response.products || [];
      const paginationData = response.pagination || { page: 1, limit: 20, total: 0 };
      
      console.log('Products data to set:', productsData);
      console.log('Pagination data to set:', paginationData);
      console.log('Products array length:', productsData.length);
      
      setProducts(productsData);
      setPagination(paginationData);
      
      // Extract unique tags from products
      const allTags = productsData.flatMap(p => p.tags || []);
      const uniqueTags = Array.from(new Map(allTags.map(tag => [tag.id, tag])).values());
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
    }
  };

  // Handle search with debouncing
  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchProducts(1);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedTags([]); // Reset tags when category changes
    fetchProducts(1);
  };

  // Handle tag toggle
  const handleToggleTag = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
    fetchProducts(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchProducts(newPage);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="hero">
          <div className="container">
            <h1>Fresh Groceries Delivered</h1>
            <p>Find the best quality products at competitive prices</p>
            <div className="hero-search">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        <div className="container main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1>Fresh Groceries Delivered</h1>
          <p>Find the best quality products at competitive prices</p>
          <div className="hero-search">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="container main-content">
        <div className="row">
          <div className="col-md-3">
            <div className="filters-card">
              <h3>Filter Products</h3>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
              <TagCloud
                tags={tags}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
              />
            </div>
          </div>
          <div className="col-md-9">
            {products.length === 0 ? (
              <div className="empty-products">
                <h3>No products found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <ProductGrid
                products={products}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;