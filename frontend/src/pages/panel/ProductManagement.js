import React, { useState, useEffect } from 'react';
import { getPendingProducts, approveProduct, rejectProduct } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';
import '../../styles/modals.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [approvalData, setApprovalData] = useState({ sale_price: '', notes: '' });
  const [rejectionNote, setRejectionNote] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getPendingProducts();
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error('بارگذاری محصولات در انتظار با خطا مواجه شد.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openApproveModal = (product) => {
    setCurrentProduct(product);
    setApprovalData({
      salePrice: product.sale_price || '',
      notes: ''
    });
    setShowApproveModal(true);
  };

  const openRejectModal = (product) => {
    setCurrentProduct(product);
    setRejectionNote('');
    setShowRejectModal(true);
  };

  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setCurrentProduct(null);
  };

  const handleApprove = async () => {
    if (!currentProduct) return;
    
    try {
      await approveProduct(currentProduct.id, approvalData);
      toast.success('Product approved successfully.');
      fetchProducts();
      closeModals();
    } catch (error) {
      toast.error('Failed to approve product.');
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!currentProduct) return;
    
    try {
      await rejectProduct(currentProduct.id, { notes: rejectionNote });
      toast.success('Product rejected successfully.');
      fetchProducts();
      closeModals();
    } catch (error) {
      toast.error('Failed to reject product.');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="panel-content-wrapper">
      <div className="panel-header">
        <h2>تایید محصولات در انتظار</h2>
      </div>

      {products.length === 0 ? (
        <div className="no-data">
          <p>هیچ محصول در انتظاری یافت نشد.</p>
        </div>
      ) : (
        <table className="panel-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>نام</th>
              <th>توضیحات</th>
              <th>دسته‌بندی</th>
              <th>قیمت</th>
              <th>موجودی</th>
              <th>فروشنده</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id.substring(0, 8)}...</td>
                <td>{product.name}</td>
                <td>{product.description?.substring(0, 50) || 'N/A'}...</td>
                <td>{product.category?.name || 'N/A'}</td>
                <td>{product.salePrice ? `$${product.salePrice.toFixed(2)}` : 'N/A'}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.seller?.name || 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-button edit-button"
                      onClick={() => openApproveModal(product)}
                    >
                      Approve
                    </button>
                    <button
                      className="action-button deactivate-button"
                      onClick={() => openRejectModal(product)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Approve Modal */}
      {showApproveModal && currentProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تایید محصول: {currentProduct.name}</h3>
            <div className="form-group">
              <label htmlFor="sale_price">قیمت فروش ($):</label>
              <input
                type="number"
                id="sale_price"
                value={approvalData.sale_price}
                onChange={(e) => setApprovalData({...approvalData, sale_price: e.target.value})}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">یادداشت‌ها:</label>
              <textarea
                id="notes"
                value={approvalData.notes}
                onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                rows="3"
                placeholder="یادداشت‌های اختیاری تایید"
              />
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeModals}>
                انصراف
              </button>
              <button className="action-button edit-button" onClick={handleApprove}>
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && currentProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>رد محصول: {currentProduct.name}</h3>
            <div className="form-group">
              <label htmlFor="rejection_note">دلیل رد:</label>
              <textarea
                id="rejection_note"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows="3"
                required
                placeholder="لطفا دلیل رد محصول را مشخص کنید"
              />
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeModals}>
                انصراف
              </button>
              <button
                className="action-button deactivate-button"
                onClick={handleReject}
                disabled={!rejectionNote.trim()}
              >
                رد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;