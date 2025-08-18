import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, assignUserRole } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status.');
      console.error(error);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await assignUserRole(userId, role);
      toast.success('User role updated successfully.');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role.');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Management</h2>
      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.phone_number}</td>
              <td>{user.is_active ? 'Active' : 'Inactive'}</td>
              <td>{user.roles && Array.isArray(user.roles) ? user.roles.map(role => role.name).join(', ') : 'No roles'}</td>
              <td>
                <button onClick={() => handleStatusChange(user.id, !user.is_active)}>
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <select onChange={(e) => handleRoleChange(user.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Change Role</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;