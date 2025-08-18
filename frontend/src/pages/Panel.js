import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPermissions } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/profile.css';
import '../styles/panel.css';

const permissionToRoute = [
  // Users
  { codename: 'user.view', label: 'User Management', path: '/panel/users', group: 'Users' },
  { codename: 'user.create', label: 'Create User', path: '/panel/users/create', group: 'Users' },
  { codename: 'user.update', label: 'Edit Users', path: '/panel/users/edit', group: 'Users' },
  { codename: 'user.delete', label: 'Delete Users', path: '/panel/users/delete', group: 'Users' },
  { codename: 'user.manage_roles', label: 'Manage Roles', path: '/panel/users/roles', group: 'Users' },

  // Products
  { codename: 'product.view', label: 'My Products', path: '/panel/products', group: 'Products' },
  { codename: 'product.create', label: 'Create Product', path: '/panel/products/create', group: 'Products' },
  { codename: 'product.update', label: 'Edit Products', path: '/panel/products/edit', group: 'Products' },
  { codename: 'product.delete', label: 'Delete Products', path: '/panel/products/delete', group: 'Products' },
  { codename: 'product.approve', label: 'Approve Products', path: '/panel/products/pending', group: 'Products' },
  { codename: 'product.view_all', label: 'All Products (Admin)', path: '/panel/products/all', group: 'Products' },

  // Invoices
  { codename: 'invoice.view', label: 'Invoices', path: '/panel/invoices', group: 'Invoices' },
  { codename: 'invoice.create', label: 'Create Invoice', path: '/panel/invoices/create', group: 'Invoices' },
  { codename: 'invoice.update', label: 'Edit Invoice', path: '/panel/invoices/edit', group: 'Invoices' },
  { codename: 'invoice.delete', label: 'Delete Invoice', path: '/panel/invoices/delete', group: 'Invoices' },
  { codename: 'invoice.view_all', label: 'All Invoices (Admin)', path: '/panel/invoices/all', group: 'Invoices' },

  // Payments
  { codename: 'payment.view', label: 'Payments', path: '/panel/payments', group: 'Payments' },
  { codename: 'payment.process', label: 'Process Payments', path: '/panel/payments/process', group: 'Payments' },
  { codename: 'payment.refund', label: 'Refunds', path: '/panel/payments/refunds', group: 'Payments' },

  // Categories
  { codename: 'category.view', label: 'Categories', path: '/panel/categories', group: 'Catalog' },
  { codename: 'category.create', label: 'Create Category', path: '/panel/categories/create', group: 'Catalog' },
  { codename: 'category.update', label: 'Edit Category', path: '/panel/categories/edit', group: 'Catalog' },
  { codename: 'category.delete', label: 'Delete Category', path: '/panel/categories/delete', group: 'Catalog' },

  // Notifications
  { codename: 'notification.view', label: 'Notifications', path: '/panel/notifications', group: 'Communications' },
  { codename: 'notification.send', label: 'Send Notification', path: '/panel/notifications/send', group: 'Communications' },
  { codename: 'notification.manage', label: 'Manage Notifications', path: '/panel/notifications/manage', group: 'Communications' },

  // Reports
  { codename: 'report.sales', label: 'Sales Reports', path: '/panel/reports/sales', group: 'Reports' },
  { codename: 'report.financial', label: 'Financial Reports', path: '/panel/reports/financial', group: 'Reports' },
  { codename: 'report.user_activity', label: 'User Activity', path: '/panel/reports/user-activity', group: 'Reports' },

  // System
  { codename: 'system.settings', label: 'System Settings', path: '/panel/settings', group: 'System' },
  { codename: 'system.logs', label: 'System Logs', path: '/panel/logs', group: 'System' },
];

const Panel = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const resp = await getUserPermissions();
        const payload = resp?.data?.permissions ?? resp?.permissions ?? resp?.data ?? resp ?? [];
        setPermissions(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load permissions', err);
        toast.error('Failed to load panel permissions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, navigate]);

  const has = (codename) => permissions.some(p => p.codename === codename || p === codename);

  const userRoles = user?.roles?.map(r => r.name) || [];
  const isAdmin = userRoles.includes('admin');

  const canView = (item) => has(item.codename);

  // Build groups from explicit `group` metadata on permissionToRoute
  const groupMap = permissionToRoute.reduce((acc, item) => {
    const groupKey = item.group || 'Other';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  // Desired display order and labels per your request
  const GROUPS_ORDER = [
    { key: 'System', label: 'System management' },
    { key: 'Reports', label: 'Report access' },
    { key: 'Communications', label: 'Notification management' },
    { key: 'Catalog', label: 'Category management' },
    { key: 'Payments', label: 'Payment management' },
    { key: 'Invoices', label: 'Invoice management' },
    { key: 'Products', label: 'Product management' },
    { key: 'Users', label: 'User management' },
  ];

  // include any other groups that exist but are not in the preferred order
  const fallbackGroups = Object.keys(groupMap).filter(g => !GROUPS_ORDER.find(x => x.key === g));

  const visibleGroupKeys = GROUPS_ORDER.map(g => g.key).concat(fallbackGroups);

  // compute final groups that have at least one permitted item
  const finalGroupKeys = visibleGroupKeys.filter(key => {
    const items = groupMap[key] || [];
    return items.some(canView);
  });

  const [openGroups, setOpenGroups] = useState(() => finalGroupKeys.reduce((a, g) => ({ ...a, [g]: true }), {}));

  const toggleGroup = (g) => setOpenGroups(s => ({ ...s, [g]: !s[g] }));

  return (
    <div className="container profile-page">
      <h2>Panel</h2>
      <div className="panel-grid">
        <aside className="panel-sidebar profile-card">
          <h4>Menu</h4>
          {loading ? <p>Loading...</p> : (
            <nav className="panel-nav">
                {visibleGroupKeys.map(groupKey => {
                  const items = groupMap[groupKey] || [];
                  // only show the group if the user has at least one permission in it
                  const permittedItems = items.filter(canView);
                  if (permittedItems.length === 0) return null;

                  const displayLabel = GROUPS_ORDER.find(g => g.key === groupKey)?.label ?? groupKey;

                  return (
                    <div key={groupKey} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{displayLabel}</strong>
                        <button onClick={() => toggleGroup(groupKey)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{openGroups[groupKey] ? '−' : '+'}</button>
                      </div>
                      {openGroups[groupKey] && (
                        <ul style={{ paddingLeft: 10, marginTop: 6 }}>
                          {permittedItems.map(item => (
                            <li key={item.codename}>
                              <NavLink to={item.path} className={({ isActive }) => isActive ? 'panel-link active' : 'panel-link'}>{item.label}</NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
            </nav>
          )}
        </aside>

        <section className="panel-content profile-card">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Panel;
