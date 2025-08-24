import React, { useEffect, useState } from 'react';
import { getMyInvoices, getDeliveryInformationByInvoiceId, confirmDeliveryWithCode, getUserById, getAddressById, downloadInvoicePDF } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';
import '../../styles/modals.css';
import './panel-invoices.css';

const Invoices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [buyerDetails, setBuyerDetails] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [buyerAddress, setBuyerAddress] = useState(null);
  const [sellerAddress, setSellerAddress] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await getMyInvoices();
        // The API returns the invoices array directly
        setItems(Array.isArray(resp) ? resp : []);
      } catch (err) {
        console.error('Failed to load invoices', err);
        setError('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleViewDeliveryInfo = async (invoiceId) => {
    try {
      const resp = await getDeliveryInformationByInvoiceId(invoiceId);
      const data = resp?.data ?? resp ?? {};
      setDeliveryInfo(data);
      setSelectedInvoice(invoiceId);
      setShowDeliveryModal(true);
    } catch (err) {
      console.error('Failed to load delivery information', err);
      setError('Failed to load delivery information');
    }
  };

  const handleConfirmDelivery = (invoiceId) => {
    setSelectedInvoice(invoiceId);
    setDeliveryCode('');
    setConfirmError(null);
    setShowConfirmModal(true);
  };

  const handleViewDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    setDetailLoading(true);
    setShowDetailModal(true);
    
    try {
      // Fetch buyer details
      if (invoice.buyerId) {
        const buyerResponse = await getUserById(invoice.buyerId);
        setBuyerDetails(buyerResponse?.data?.user || buyerResponse);
      }
      
      // Fetch seller details (assuming sellerId is available in invoice)
      if (invoice.sellerId) {
        const sellerResponse = await getUserById(invoice.sellerId);
        setSellerDetails(sellerResponse?.data?.user || sellerResponse);
      }
      
      // Fetch addresses if available
      if (invoice.buyerAddressId) {
        const buyerAddressResponse = await getAddressById(invoice.buyerAddressId);
        setBuyerAddress(buyerAddressResponse?.data?.address || buyerAddressResponse);
      }
      
      if (invoice.sellerAddressId) {
        const sellerAddressResponse = await getAddressById(invoice.sellerAddressId);
        setSellerAddress(sellerAddressResponse?.data?.address || sellerAddressResponse);
      }
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
      toast.error('خطا در دریافت جزئیات فاکتور');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoice) return;
    
    try {
      const pdfBlob = await downloadInvoicePDF(selectedInvoice.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${selectedInvoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF با موفقیت دانلود شد');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('خطا در دانلود PDF');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!deliveryCode || deliveryCode.length !== 6) {
      setConfirmError('لطفا یک کد تحویل 6 رقمی معتبر وارد کنید');
      return;
    }

    try {
      setConfirmLoading(true);
      await confirmDeliveryWithCode({
        delivery_code: deliveryCode,
        seller_invoice_id: selectedInvoice
      });
      
      // Update the invoice status in the list
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedInvoice
            ? { ...item, status: 'DELIVERED' }
            : item
        )
      );
      
      setShowConfirmModal(false);
      setDeliveryCode('');
      setConfirmError(null);
    } catch (err) {
      console.error('Failed to confirm delivery', err);
      setConfirmError(err.response?.data?.message || 'خطا در تایید تحویل');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-badge active';
      case 'pending':
        return 'status-badge pending';
      case 'delivered':
        return 'status-badge active';
      default:
        return 'status-badge inactive';
    }
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری فاکتورها...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="panel-content-wrapper">
      <div className="panel-header">
        <h2>فاکتورهای من</h2>
      </div>

      {items.length === 0 ? (
        <div className="no-data">هیچ فاکتوری یافت نشد</div>
      ) : (
        <table className="panel-table">
          <thead>
            <tr>
              <th>شناسه فاکتور</th>
              <th>شناسه سفارش</th>
              <th>مبلغ کل</th>
              <th>وضعیت</th>
              <th>تاریخ ایجاد</th>
              <th>آیتم‌های فاکتور</th>
              <th>کد تحویل</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.orderId}</td>
                <td>${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                <td>
                  <span className={getStatusBadgeClass(invoice.status)}>
                    {invoice.status || 'ناشناخته'}
                  </span>
                </td>
                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                <td>
                  {invoice.invoiceItems && invoice.invoiceItems.length > 0 ? (
                    <div>
                      {invoice.invoiceItems.map((item, index) => (
                        <div key={index} className="invoice-item">
                          <div>شناسه محصول: {item.productId}</div>
                          <div>تعداد: {item.quantity}</div>
                          <div>قیمت واحد: ${item.unitPrice?.toFixed(2) || '0.00'}</div>
                          <div>قیمت کل: ${item.totalPrice?.toFixed(2) || '0.00'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>هیچ آیتمی</div>
                  )}
                </td>
                <td>
                  {invoice.deliveryCode ? (
                    <span className="delivery-code-badge">{invoice.deliveryCode}</span>
                  ) : (
                    <span className="no-code">بدون کد</span>
                  )}
                </td>
                <td className="action-buttons">
                  <button
                    className="action-button edit-button"
                    onClick={() => handleViewDeliveryInfo(invoice.id)}
                  >
                    اطلاعات تحویل
                  </button>
                  <button
                    className="action-button view-button"
                    onClick={() => handleViewDetails(invoice)}
                    disabled={detailLoading}
                  >
                    {detailLoading ? 'در حال بارگذاری...' : 'مشاهده جزئیات'}
                  </button>
                  {invoice.deliveryCode ? (
                    <span className="delivery-code-display">{invoice.deliveryCode}</span>
                  ) : (
                    invoice.status?.toLowerCase() !== 'delivered' && (
                      <button
                        className="action-button stock-button"
                        onClick={() => handleConfirmDelivery(invoice.id)}
                      >
                        تایید تحویل
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delivery Information Modal */}
      {showDeliveryModal && deliveryInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>اطلاعات تحویل</h3>
            <div className="form-group">
              <label>آدرس تحویل:</label>
              <p>{deliveryInfo.deliveryAddress || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label>تاریخ درخواست تحویل:</label>
              <p>{deliveryInfo.deliveryDateRequested ? new Date(deliveryInfo.deliveryDateRequested).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="form-group">
              <label>وضعیت:</label>
              <p>{deliveryInfo.status || 'N/A'}</p>
            </div>
            <div className="form-group">
              <label>دستورالعمل‌های ویژه:</label>
              <p>{deliveryInfo.specialInstructions || 'هیچ'}</p>
            </div>
            <div className="modal-actions">
              <button
                className="action-button"
                onClick={() => setShowDeliveryModal(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تایید تحویل</h3>
            <div className="form-group">
              <label>کد تحویل:</label>
              <input
                type="text"
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
                placeholder="کد 6 رقمی را وارد کنید"
                maxLength="6"
                className="form-control"
              />
            </div>
            {confirmError && (
              <div className="error" style={{ marginBottom: '10px' }}>
                {confirmError}
              </div>
            )}
            <div className="modal-actions">
              <button
                className="action-button"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirmLoading}
              >
                انصراف
              </button>
              <button
                className="action-button activate-button"
                onClick={handleConfirmSubmit}
                disabled={confirmLoading}
              >
                {confirmLoading ? 'در حال تایید...' : 'تایید تحویل'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content invoice-detail-modal">
            <div className="modal-header">
              <h3>جزئیات فاکتور</h3>
              <button
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                &times;
              </button>
            </div>
            
            {detailLoading ? (
              <div className="loading">در حال بارگذاری جزئیات...</div>
            ) : (
              <>
                <div className="invoice-info">
                  <h4>اطلاعات فاکتور</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>شناسه فاکتور:</label>
                      <span>{selectedInvoice.id}</span>
                    </div>
                    <div className="info-item">
                      <label>شناسه سفارش:</label>
                      <span>{selectedInvoice.orderId || selectedInvoice.order_id}</span>
                    </div>
                    <div className="info-item">
                      <label>مبلغ کل:</label>
                      <span>${selectedInvoice.totalAmount?.toFixed(2) || selectedInvoice.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <label>وضعیت:</label>
                      <span className={getStatusBadgeClass(selectedInvoice.status)}>
                        {selectedInvoice.status || 'ناشناخته'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>تاریخ ایجاد:</label>
                      <span>{selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>تاریخ به‌روزرسانی:</label>
                      <span>{selectedInvoice.updatedAt ? new Date(selectedInvoice.updatedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {buyerDetails && (
                  <div className="party-info">
                    <h4>اطلاعات خریدار</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>شناسه:</label>
                        <span>{buyerDetails.id}</span>
                      </div>
                      <div className="info-item">
                        <label>نام:</label>
                        <span>{buyerDetails.firstName && buyerDetails.lastName ?
                          `${buyerDetails.firstName} ${buyerDetails.lastName}` :
                          buyerDetails.name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>ایمیل:</label>
                        <span>{buyerDetails.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>تلفن:</label>
                        <span>{buyerDetails.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>کد مشتری:</label>
                        <span>{buyerDetails.customerCode || 'N/A'}</span>
                      </div>
                    </div>
                    {buyerAddress && (
                      <div className="address-info">
                        <h5>آدرس خریدار</h5>
                        <p>{buyerAddress.fullAddress || buyerAddress.full_address}</p>
                        <p>{buyerAddress.city}, {buyerAddress.postalCode || buyerAddress.postal_code}</p>
                      </div>
                    )}
                  </div>
                )}

                {sellerDetails && (
                  <div className="party-info">
                    <h4>اطلاعات فروشنده</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>شناسه:</label>
                        <span>{sellerDetails.id}</span>
                      </div>
                      <div className="info-item">
                        <label>نام:</label>
                        <span>{sellerDetails.firstName && sellerDetails.lastName ?
                          `${sellerDetails.firstName} ${sellerDetails.lastName}` :
                          sellerDetails.name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>ایمیل:</label>
                        <span>{sellerDetails.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>تلفن:</label>
                        <span>{sellerDetails.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>کد مشتری:</label>
                        <span>{sellerDetails.customerCode || 'N/A'}</span>
                      </div>
                    </div>
                    {sellerAddress && (
                      <div className="address-info">
                        <h5>آدرس فروشنده</h5>
                        <p>{sellerAddress.fullAddress || sellerAddress.full_address}</p>
                        <p>{sellerAddress.city}, {sellerAddress.postalCode || sellerAddress.postal_code}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className="action-button"
                    onClick={() => setShowDetailModal(false)}
                  >
                    بستن
                  </button>
                  <button
                    className="action-button download-button"
                    onClick={handleDownloadPDF}
                  >
                    دانلود PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
