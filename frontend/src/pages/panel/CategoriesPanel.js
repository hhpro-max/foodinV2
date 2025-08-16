import React, { useEffect, useState } from 'react';
import { getCategories } from '../../services/api';

const CategoriesPanel = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getCategories();
        const data = resp?.data ?? resp?.categories ?? resp ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h3>Categories</h3>
      <ul>
        {items.map(c => <li key={c.id}>{c.name}</li>)}
      </ul>
    </div>
  );
};

export default CategoriesPanel;
