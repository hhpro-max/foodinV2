import React, { useState, useEffect } from 'react';
import { getMyInvoices } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getMyInvoices();
      // The API returns the invoices array directly
      setInvoices(Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error('Failed to fetch invoices.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Invoice Management</h2>
      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.order_id}</td>
              <td>{invoice.total_amount}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceManagement;