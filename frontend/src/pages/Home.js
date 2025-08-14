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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.data.categories);

        // Fetch products
        await fetchProducts();
      } catch (error) {
        console.error('Error fetching data:', error);
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
      category: selectedCategory,
      tags: selectedTags.join(',')
    };

    try {
      const response = await getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      // Extract unique tags from products
      const allTags = response.data.products.flatMap(p => p.tags);
      const uniqueTags = Array.from(new Map(allTags.map(tag => [tag.id, tag])).values());
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching products:', error);
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
            <ProductGrid
              products={products}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;