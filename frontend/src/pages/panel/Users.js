import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await api.get('/users', { params: { limit: 50 } });
        // backend may return { status, data: { users: [...] } } or { data: [...] }
        const payload = resp?.data ?? resp;
        const list = payload?.data ?? payload?.users ?? payload;
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleActive = async (userId, currentlyActive) => {
    try {
      if (currentlyActive) {
        await api.patch(`/users/${userId}/deactivate`);
      } else {
        await api.patch(`/users/${userId}/activate`);
      }
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, isActive: !currentlyActive } : u));
    } catch (err) {
      console.error('Failed to toggle active', err);
    }
  };

  return (
    <div>
      <h3>Users</h3>
      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Roles</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username || u.phone}</td>
                <td>{u.email}</td>
                <td>{u.roles ? u.roles.join(', ') : u.role}</td>
                <td>{u.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleActive(u.id, !!u.isActive)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
