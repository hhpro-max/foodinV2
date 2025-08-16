import React, { useEffect, useState } from 'react';
import { getInvoices, markInvoiceAsPaid } from '../../services/api';

const Payments = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getInvoices({ limit: 50 });
        const data = resp?.data ?? resp?.invoices ?? resp ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load invoices', err);
      }
    };

    load();
  }, []);

  const markPaid = async (id) => {
    try {
      await markInvoiceAsPaid(id);
      setItems((prev) => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
    } catch (err) {
      console.error('Failed to mark paid', err);
    }
  };

  return (
    <div>
      <h3>Payments / Invoices</h3>
      <ul>
        {items.map(i => (
          <li key={i.id}>{i.id} - {i.total || i.amount || i.price} - {i.status}
            {i.status !== 'paid' && <button onClick={() => markPaid(i.id)}>Mark Paid</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Payments;
