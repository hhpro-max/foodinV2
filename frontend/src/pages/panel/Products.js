import React, { useEffect, useState } from 'react';
import { getPendingProducts, getAllProductsAdmin, approveProduct, rejectProduct, getSellerProducts, getUserPermissions } from '../../services/api';
import { Link } from 'react-router-dom';

// Helper to determine permission presence from permissions payload
const hasPermission = (permissions, codename) => permissions.some(p => p.codename === codename || p === codename);

const Products = () => {
  const [items, setItems] = useState([]);
  const [view, setView] = useState('all'); // 'all' | 'pending' | 'approved' | 'mine'
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // fetch permissions
        const permsResp = await getUserPermissions();
        let perms = permsResp?.data?.permissions ?? permsResp?.permissions ?? permsResp?.data ?? permsResp ?? [];
        // unwrap nested permission objects if present
        if (!Array.isArray(perms) && perms?.permissions) perms = perms.permissions;
        if (!Array.isArray(perms) && perms?.data) perms = perms.data;
        setPermissions(Array.isArray(perms) ? perms : []);

        // helper to extract products array from various response shapes
        const extractProducts = (resp) => {
          const inner = resp?.data ?? resp;
          if (Array.isArray(inner)) return inner;
          if (inner?.products && Array.isArray(inner.products)) return inner.products;
          if (resp?.products && Array.isArray(resp.products)) return resp.products;
          return [];
        };

        if (hasPermission(perms, 'product.view_all')) {
          const resp = view === 'pending' ? await getPendingProducts({ limit: 50 }) : await getAllProductsAdmin({ limit: 50 });
          setItems(extractProducts(resp));
        } else if (hasPermission(perms, 'product.view')) {
          // seller: fetch only their products
          const resp = await getSellerProducts({ limit: 50 });
          setItems(extractProducts(resp));
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load products', err);
        setItems([]);
      }
    };
    load();
  }, [view]);

  const doApprove = async (id) => {
    try {
      await approveProduct(id, { sale_price: 1 });
      setItems((prev) => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const doReject = async (id) => {
    try {
      await rejectProduct(id, { reason: 'Not acceptable' });
      setItems((prev) => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Reject failed', err);
    }
  };

  return (
    <div>
      <h3>Products ({view})</h3>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setView('all')}>All</button>
        <button onClick={() => setView('pending')}>Pending</button>
        <button onClick={() => setView('approved')}>Approved</button>
        <button onClick={() => setView('mine')}>My Products</button>
      </div>
      <ul>
        {items
          .filter(p => {
            if (view === 'all') return true;
            if (view === 'pending') return p.status === 'pending' || p.status === 'submitted' || p.status === 'awaiting_approval';
            if (view === 'approved') return p.status === 'approved' || p.isActive === true;
            if (view === 'mine') return true; // already scoped to seller when applicable
            return true;
          })
          .map(p => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <strong>{p.name || p.title || p.code}</strong>
            <div style={{ fontSize: 13, color: '#666' }}>
              Status: {p.status} {p.isActive ? '(active)' : ''}
            </div>

            <div style={{ marginTop: 6 }}>
              {/* Edit link uses distinct path to avoid NavLink selection conflicts */}
              <Link to={`/panel/products/edit/${p.id}`}>Edit</Link>
              {' '}
              <Link to={`/panel/products/view/${p.id}`}>View</Link>

              {/* Only admins (or users with approve permission) can approve/reject */}
              {hasPermission(permissions, 'product.view_all') || hasPermission(permissions, 'product.approve') ? (
                p.status === 'pending' ? (
                  <>
                    <button onClick={() => doApprove(p.id)}>Approve</button>
                    <button onClick={() => doReject(p.id)}>Reject</button>
                  </>
                ) : null
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
