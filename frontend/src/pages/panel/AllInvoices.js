import React, { useState, useEffect } from 'react';
import { getInvoices, getUserById, getAddressById, downloadInvoicePDF } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';
import './panel-invoices.css';

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [buyerDetails, setBuyerDetails] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [buyerAddress, setBuyerAddress] = useState(null);
  const [sellerAddress, setSellerAddress] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInvoices();
      // The API returns the invoices array directly
      setInvoices(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError('Failed to fetch invoices');
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
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
      toast.error('Failed to fetch invoice details');
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
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

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
    return <div className="loading">Loading all invoices...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="panel-content-wrapper">
      <div className="panel-header">
        <h2>All Invoices</h2>
        <button 
          className="refresh-button"
          onClick={fetchInvoices}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="no-data">No invoices found</div>
      ) : (
        <table className="panel-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Order ID</th>
              <th>Buyer ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.orderId || invoice.order_id}</td>
                <td>{invoice.buyerId || invoice.buyer_id}</td>
                <td>${invoice.totalAmount?.toFixed(2) || invoice.total_amount?.toFixed(2) || '0.00'}</td>
                <td>
                  <span className={getStatusBadgeClass(invoice.status)}>
                    {invoice.status || 'Unknown'}
                  </span>
                </td>
                <td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>{invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleDateString() : 'N/A'}</td>
                <td className="action-buttons">
                  <button
                    className="action-button view-button"
                    onClick={() => handleViewDetails(invoice)}
                    disabled={detailLoading}
                  >
                    {detailLoading ? 'Loading...' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <>
      <div className="panel-content-wrapper">
        <div className="panel-header">
          <h2>All Invoices</h2>
          <button
            className="refresh-button"
            onClick={fetchInvoices}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="no-data">No invoices found</div>
        ) : (
          <table className="panel-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Order ID</th>
                <th>Buyer ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.orderId || invoice.order_id}</td>
                  <td>{invoice.buyerId || invoice.buyer_id}</td>
                  <td>${invoice.totalAmount?.toFixed(2) || invoice.total_amount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="action-buttons">
                    <button
                      className="action-button view-button"
                      onClick={() => handleViewDetails(invoice)}
                      disabled={detailLoading}
                    >
                      {detailLoading ? 'Loading...' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content invoice-detail-modal">
            <div className="modal-header">
              <h3>Invoice Details</h3>
              <button
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                &times;
              </button>
            </div>
            
            {detailLoading ? (
              <div className="loading">Loading details...</div>
            ) : (
              <>
                <div className="invoice-info">
                  <h4>Invoice Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Invoice ID:</label>
                      <span>{selectedInvoice.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Order ID:</label>
                      <span>{selectedInvoice.orderId || selectedInvoice.order_id}</span>
                    </div>
                    <div className="info-item">
                      <label>Total Amount:</label>
                      <span>${selectedInvoice.totalAmount?.toFixed(2) || selectedInvoice.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span className={getStatusBadgeClass(selectedInvoice.status)}>
                        {selectedInvoice.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Created At:</label>
                      <span>{selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Updated At:</label>
                      <span>{selectedInvoice.updatedAt ? new Date(selectedInvoice.updatedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {buyerDetails && (
                  <div className="party-info">
                    <h4>Buyer Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>ID:</label>
                        <span>{buyerDetails.id}</span>
                      </div>
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{buyerDetails.firstName && buyerDetails.lastName ?
                          `${buyerDetails.firstName} ${buyerDetails.lastName}` :
                          buyerDetails.name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{buyerDetails.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone:</label>
                        <span>{buyerDetails.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Customer Code:</label>
                        <span>{buyerDetails.customerCode || 'N/A'}</span>
                      </div>
                    </div>
                    {buyerAddress && (
                      <div className="address-info">
                        <h5>Buyer Address</h5>
                        <p>{buyerAddress.fullAddress || buyerAddress.full_address}</p>
                        <p>{buyerAddress.city}, {buyerAddress.postalCode || buyerAddress.postal_code}</p>
                      </div>
                    )}
                  </div>
                )}

                {sellerDetails && (
                  <div className="party-info">
                    <h4>Seller Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>ID:</label>
                        <span>{sellerDetails.id}</span>
                      </div>
                      <div className="info-item">
                        <label>Name:</label>
                        <span>{sellerDetails.firstName && sellerDetails.lastName ?
                          `${sellerDetails.firstName} ${sellerDetails.lastName}` :
                          sellerDetails.name || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Email:</label>
                        <span>{sellerDetails.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Phone:</label>
                        <span>{sellerDetails.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Customer Code:</label>
                        <span>{sellerDetails.customerCode || 'N/A'}</span>
                      </div>
                    </div>
                    {sellerAddress && (
                      <div className="address-info">
                        <h5>Seller Address</h5>
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
                    Close
                  </button>
                  <button
                    className="action-button download-button"
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AllInvoices;