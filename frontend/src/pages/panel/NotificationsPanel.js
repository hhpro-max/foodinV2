import React, { useEffect, useState } from 'react';
import { getNotifications, sendNotification } from '../../services/api';

const NotificationsPanel = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ userId: '', type: 'info', message: '' });
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await getNotifications({ limit: 50 });
        const data = resp?.data ?? resp?.notifications ?? resp ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await sendNotification(form);
      alert('Notification sent');
    } catch (err) {
      console.error('Failed to send notification', err);
      alert('Failed to send');
    }
  };

  return (
    <div>
      <h3>Notifications</h3>
      <form onSubmit={handleSend} style={{ marginBottom: 12 }}>
        <input placeholder="userId (optional)" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} />
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="alert">Alert</option>
        </select>
        <input placeholder="message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
        <button type="submit">Send</button>
      </form>
      <ul>
        {items.map(n => <li key={n.id}>{n.title || n.message || JSON.stringify(n)}</li>)}
      </ul>
    </div>
  );
};

export default NotificationsPanel;

