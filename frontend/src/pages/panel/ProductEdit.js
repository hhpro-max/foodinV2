import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct, getCategories } from '../../services/api';
import toast from 'react-hot-toast';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    purchase_price: '',
    stock_quantity: '',
    min_order_quantity: '',
    unit: 'piece',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    tags: ''
  });

  useEffect(() => {
    let mounted = true;
    const loadProduct = async () => {
      try {
        const resp = await getProduct(id);
        if (!mounted) return;
        setProduct(resp);
        
        // Set form data with product values
        setFormData({
          name: resp.name || '',
          description: resp.description || '',
          category_id: resp.categoryId || '',
          purchase_price: resp.purchasePrice || '',
          stock_quantity: resp.stockQuantity || '',
          min_order_quantity: resp.minOrderQuantity || '',
          unit: resp.unit || 'piece',
          weight: resp.weight || '',
          dimensions: {
            length: resp.dimensions?.length || '',
            width: resp.dimensions?.width || '',
            height: resp.dimensions?.height || ''
          },
          tags: resp.tags ? resp.tags.map(tag => tag.name).join(', ') : ''
        });
      } catch (err) {
        console.error('Failed to load product', err);
        toast.error('Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    const loadCategories = async () => {
      try {
        const resp = await getCategories();
        if (!mounted) return;
        setCategories(resp.data?.categories || resp.categories || resp || []);
      } catch (err) {
        console.error('Failed to load categories', err);
        toast.error('Failed to load categories');
      }
    };
    
    loadProduct();
    loadCategories();
    
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested dimensions fields
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      // Create FormData instance
      const formDataToSend = new FormData();
      
      // Add all fields to FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('purchase_price', formData.purchase_price);
      formDataToSend.append('stock_quantity', formData.stock_quantity);
      formDataToSend.append('min_order_quantity', formData.min_order_quantity);
      formDataToSend.append('unit', formData.unit);
      
      if (formData.weight) {
        formDataToSend.append('weight', formData.weight);
      }
      
      // Add dimensions if any are provided
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        const dimensions = {};
        if (formData.dimensions.length) dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width) dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height) dimensions.height = parseFloat(formData.dimensions.height);
        formDataToSend.append('dimensions', JSON.stringify(dimensions));
      }
      
      // Add tags if provided
      if (formData.tags) {
        formDataToSend.append('tags', formData.tags);
      }
      
      await updateProduct(id, formDataToSend);
      toast.success('Product updated successfully');
      navigate('/panel/products');
    } catch (err) {
      console.error('Failed to update product', err);
      toast.error('Failed to update product: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found.</div>;

  return (
    <div className="panel-content-wrapper">
      <div className="panel-header">
        <h2>Edit Product: {product.name}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="form-control"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="unit">Unit *</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="piece">Piece</option>
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="lb">Pound</option>
              <option value="oz">Ounce</option>
              <option value="liter">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="m">Meter</option>
              <option value="cm">Centimeter</option>
              <option value="mm">Millimeter</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchase_price">Purchase Price *</label>
            <input
              type="number"
              id="purchase_price"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stock_quantity">Stock Quantity *</label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="min_order_quantity">Min Order Quantity *</label>
            <input
              type="number"
              id="min_order_quantity"
              name="min_order_quantity"
              value={formData.min_order_quantity}
              onChange={handleChange}
              min="1"
              required
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="weight">Weight (optional)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.001"
            min="0"
            className="form-control"
          />
        </div>
        
        <fieldset className="form-fieldset">
          <legend>Dimensions (optional)</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dimensions.length">Length</label>
              <input
                type="number"
                id="dimensions.length"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensions.width">Width</label>
              <input
                type="number"
                id="dimensions.width"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dimensions.height">Height</label>
              <input
                type="number"
                id="dimensions.height"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="form-control"
              />
            </div>
          </div>
        </fieldset>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            className="form-control"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="action-button"
            onClick={() => navigate('/panel/products')}
            disabled={updating}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="action-button edit-button"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
