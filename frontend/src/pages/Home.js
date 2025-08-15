import React, { useState, useEffect, useCallback } from 'react';
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

  // Fetch products with current filters
  const fetchProducts = useCallback(async (page = 1) => {
    const params = {
      page,
      limit: pagination.limit,
      search: searchQuery,
      category_id: selectedCategory,
      tags: selectedTags.join(',')
    };

    console.log('Fetching products with params:', params);

    try {
      const response = await getProducts(params);
      console.log('API service response:', response);
      console.log('API service response structure:', {
        hasProducts: !!response.products,
        productsLength: response.products?.length,
        productsType: typeof response.products,
        hasPagination: !!response.pagination,
        responseKeys: Object.keys(response),
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      // Check if response has the expected structure
      let productsData, paginationData;
      
      if (response.products) {
        // Direct access
        productsData = response.products;
        paginationData = response.pagination;
      } else if (response.data && response.data.products) {
        // Nested access
        productsData = response.data.products;
        paginationData = response.data.pagination;
      } else {
        // Fallback - check if response itself is the data
        productsData = Array.isArray(response) ? response : [];
        paginationData = { page: 1, limit: 20, total: 0 };
      }
      
      console.log('Final products data:', productsData);
      console.log('Final pagination data:', paginationData);
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
  }, [searchQuery, selectedCategory, selectedTags, pagination.limit]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');
        
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
  }, []); // Empty dependency array - only run once on mount

  // Fetch products when filters change
  useEffect(() => {
    if (!loading) { // Only fetch if initial load is complete
      fetchProducts(1);
    }
  }, [fetchProducts, loading]);

  // Handle search with debouncing
  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 500),
    []
  );

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedTags([]); // Reset tags when category changes
  }, []);

  // Handle tag toggle
  const handleToggleTag = useCallback((tagId) => {
    setSelectedTags(prev => {
      const newSelectedTags = prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      return newSelectedTags;
    });
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    fetchProducts(newPage);
  }, [fetchProducts]);

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