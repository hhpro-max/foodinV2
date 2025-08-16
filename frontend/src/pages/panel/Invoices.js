import React, { useEffect, useState } from 'react';
import { getInvoices } from '../../services/api';

const Invoices = () => {
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

  return (
    <div>
      <h3>Invoices</h3>
      <ul>
        {items.map(i => <li key={i.id}>{i.id} - {i.total || i.amount}</li>)}
      </ul>
    </div>
  );
};

export default Invoices;
