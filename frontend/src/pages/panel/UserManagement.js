import React, { useState, useEffect } from 'react';
import { getUsers, getRoles, updateUserStatus, assignUserRole } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/panel-table.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data.roles || []);
    } catch (error) {
      toast.error('Failed to fetch roles.');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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

  const handleRoleChange = async (userId, roleId) => {
    try {
      await assignUserRole(userId, roleId);
      toast.success('User role updated successfully.');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role.');
      console.error(error);
    }
  };

  const handleEditUser = (userId) => {
    // For now, we'll just show an alert
    // In a real implementation, this would navigate to an edit page or open a modal
    alert(`Edit user with ID: ${userId}`);
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
            <th>Name</th>
            <th>Email</th>
            <th>Customer Code</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id.substring(0, 8)}...</td>
              <td>{user.phone}</td>
              <td>
                {user.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : 'N/A'}
              </td>
              <td>{user.profile ? user.profile.email || 'N/A' : 'N/A'}</td>
              <td>{user.profile ? user.profile.customerCode || 'N/A' : 'N/A'}</td>
              <td>
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                {user.roles && Array.isArray(user.roles)
                  ? user.roles.map(role => role.name).join(', ')
                  : 'No roles'}
              </td>
              <td>
                <button
                  onClick={() => handleEditUser(user.id)}
                  className="action-button edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStatusChange(user.id, !user.isActive)}
                  className={`action-button ${user.isActive ? 'deactivate-button' : 'activate-button'}`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <select
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  defaultValue=""
                  className="role-select"
                >
                  <option value="" disabled>Change Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
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