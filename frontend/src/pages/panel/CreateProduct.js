import React, { useEffect, useState } from 'react';
import { getCategories, createProduct } from '../../services/api';
import '../../styles/panel.css';
import './panel-product.css';

const extractCategories = (resp) => {
  // backend returns { status, data: <result> } where result may be { categories: [...] } or an array
  const d = resp?.data ?? resp;
  return d?.categories ?? d?.data ?? d;
};

const CreateProduct = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    purchase_price: '',
    stock_quantity: 0,
    min_order_quantity: 1,
    unit: 'piece',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getCategories();
        const data = extractCategories(resp) ?? [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    // cleanup previews when images change
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  const handleFile = (e) => {
    setImages(Array.from(e.target.files));
  };

  const validate = () => {
    const err = {};
    if (!form.name || form.name.trim().length < 2) err.name = 'Name must be at least 2 characters';
    const price = parseFloat(form.purchase_price);
    if (Number.isNaN(price) || price <= 0) err.purchase_price = 'Purchase price must be a positive number';
    if (form.min_order_quantity < 1) err.min_order_quantity = 'Min order must be at least 1';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.category_id) fd.append('category_id', form.category_id);
      fd.append('purchase_price', form.purchase_price);
      fd.append('stock_quantity', form.stock_quantity);
      fd.append('min_order_quantity', form.min_order_quantity);
      fd.append('unit', form.unit);
      if (form.weight) fd.append('weight', form.weight);
      if (form.dimensions.length) fd.append('dimensions[length]', form.dimensions.length);
      if (form.dimensions.width) fd.append('dimensions[width]', form.dimensions.width);
      if (form.dimensions.height) fd.append('dimensions[height]', form.dimensions.height);
      if (form.tags) {
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(t => fd.append('tags[]', t));
      }
      images.forEach((file) => fd.append('images', file));

      const resp = await createProduct(fd);
      alert('Product created');
      console.log('created', resp);
      // reset form
      setForm({ name: '', description: '', category_id: '', purchase_price: '', stock_quantity: 0, min_order_quantity: 1, unit: 'piece', weight: '', dimensions: { length: '', width: '', height: '' }, tags: '' });
      setImages([]);
    } catch (err) {
      console.error('Create failed', err);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card panel-product-create">
      <h3>Create Product</h3>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <label>Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="form-row">
          <label>Category</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
            <option value="">-- none --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {categories.length === 0 && <div className="muted">No categories available</div>}
        </div>

        <div className="form-row inline">
          <div>
            <label>Purchase Price *</label>
            <input type="number" step="0.01" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} />
            {errors.purchase_price && <div className="error">{errors.purchase_price}</div>}
          </div>
          <div>
            <label>Stock Quantity</label>
            <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: Number(e.target.value) }))} />
          </div>
          <div>
            <label>Min Order Qty</label>
            <input type="number" value={form.min_order_quantity} onChange={e => setForm(f => ({ ...f, min_order_quantity: Number(e.target.value) }))} />
            {errors.min_order_quantity && <div className="error">{errors.min_order_quantity}</div>}
          </div>
        </div>

        <div className="form-row inline">
          <div>
            <label>Unit</label>
            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
          </div>
          <div>
            <label>Weight</label>
            <input type="number" step="0.001" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
          </div>
        </div>

        <div className="form-row">
          <label>Dimensions (L x W x H)</label>
          <div className="inline">
            <input placeholder="length" value={form.dimensions.length} onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, length: e.target.value } }))} />
            <input placeholder="width" value={form.dimensions.width} onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, width: e.target.value } }))} />
            <input placeholder="height" value={form.dimensions.height} onChange={e => setForm(f => ({ ...f, dimensions: { ...f.dimensions, height: e.target.value } }))} />
          </div>
        </div>

        <div className="form-row">
          <label>Tags (comma separated)</label>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        </div>

        <div className="form-row">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleFile} />
          <div className="previews">
            {previewUrls.map((u, i) => (
              <img key={i} src={u} alt={`preview-${i}`} />
            ))}
          </div>
        </div>

        <div className="form-row actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
