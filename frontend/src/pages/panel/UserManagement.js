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
      toast.error('بارگذاری کاربران با خطا مواجه شد.');
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
      toast.error('بارگذاری نقش‌ها با خطا مواجه شد.');
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
      toast.success(`کاربر با موفقیت ${isActive ? 'فعال' : 'غیرفعال'} شد.`);
      fetchUsers();
    } catch (error) {
      toast.error('به‌روزرسانی وضعیت کاربر با خطا مواجه شد.');
      console.error(error);
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await assignUserRole(userId, roleId);
      toast.success('نقش کاربر با موفقیت به‌روزرسانی شد.');
      fetchUsers();
    } catch (error) {
      toast.error('به‌روزرسانی نقش کاربر با خطا مواجه شد.');
      console.error(error);
    }
  };

  const handleEditUser = (userId) => {
    // For now, we'll just show an alert
    // In a real implementation, this would navigate to an edit page or open a modal
    alert(`Edit user with ID: ${userId}`);
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div>
      <h2>مدیریت کاربران</h2>
      <table className="panel-table">
        <thead>
          <tr>
            <th>شناسه</th>
            <th>تلفن</th>
            <th>نام</th>
            <th>ایمیل</th>
            <th>کد مشتری</th>
            <th>وضعیت</th>
            <th>نقش‌ها</th>
            <th>اقدامات</th>
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
                  {user.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td>
                {user.roles && Array.isArray(user.roles)
                  ? user.roles.map(role => role.name).join(', ')
                  : 'بدون نقش'}
              </td>
              <td>
                <button
                  onClick={() => handleEditUser(user.id)}
                  className="action-button edit-button"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleStatusChange(user.id, !user.isActive)}
                  className={`action-button ${user.isActive ? 'deactivate-button' : 'activate-button'}`}
                >
                  {user.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                </button>
                <select
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  defaultValue=""
                  className="role-select"
                >
                  <option value="" disabled>تغییر نقش</option>
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