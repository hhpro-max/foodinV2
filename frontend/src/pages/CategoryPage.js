import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import TagCloud from '../components/TagCloud';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getCategories, getCategory } from '../services/api';

const CategoryPage = () => {
  const { id: categoryIdFromUrl } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromUrl);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Fetch category information
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const response = await getCategory(categoryIdFromUrl);
        setCategoryInfo(response);
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    };

    fetchCategoryInfo();
  }, [categoryIdFromUrl]);

  // Fetch products with current filters
  const fetchProducts = useCallback(async (page = 1) => {
    const params = {
      page,
      limit: 20,
      search: searchQuery || undefined,
      category_id: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined
    };

    console.log('Fetching products with params:', params);

    try {
      const { products: productsData, pagination: paginationData } = await getProducts(params);
      console.log('API response products:', productsData);
      console.log('API response pagination:', paginationData);
      
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
  }, [searchQuery, selectedCategory, selectedTags]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategoriesOnly = async () => {
      try {
        console.log('Fetching categories...');
        const categoriesResponse = await getCategories();
        console.log('Categories response:', categoriesResponse);

        let catList = [];
        if (Array.isArray(categoriesResponse)) {
          catList = categoriesResponse;
        } else if (Array.isArray(categoriesResponse.categories)) {
          catList = categoriesResponse.categories;
        } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data.categories)) {
          catList = categoriesResponse.data.categories;
        } else {
          const arr = Object.values(categoriesResponse).find((v) => Array.isArray(v));
          if (Array.isArray(arr)) catList = arr;
        }

        setCategories(catList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategoriesOnly();
  }, []);

  // Fetch products on mount and when filters change
  const isInitialLoad = useRef(true);
  useEffect(() => {
    setLoading(true);
    fetchProducts(1).finally(() => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
      setLoading(false);
    });
  }, [searchQuery, selectedCategory, selectedTags]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query) {
      setSelectedCategory(null); // Reset category when searching
    }
  }, []);

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

  // Handle back to home
  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="page-header">
            <button onClick={handleBackToHome} className="back-link">
              ← بازگشت به خانه
            </button>
            <h1>در حال بارگذاری...</h1>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>در حال بارگذاری محصولات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="page-header">
          <button onClick={handleBackToHome} className="back-link">
            ← بازگشت به خانه
          </button>
          <h1>{categoryInfo?.name || 'Category Products'}</h1>
          <p>{categoryInfo?.description || 'Browse products in this category'}</p>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="filters-card">
              <h3>فیلتر محصولات</h3>
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
                <h3>هیچ محصولی یافت نشد</h3>
                <p>برای پیدا کردن مورد نظر خود، جستجو یا فیلترها را تنظیم کنید.</p>
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

export default CategoryPage;