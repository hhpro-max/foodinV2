import React, { useEffect, useState } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import '../styles/profile.css';

const Addresses = () => {
	const [addresses, setAddresses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const { user, isAuthenticated } = useAuth();
	const [form, setForm] = useState({ title: '', address: '', city: '', postal_code: '', gps_latitude: '', gps_longitude: '' });

	const fetch = async () => {
		if (!isAuthenticated) return;
		setLoading(true);
		try {
			const resp = await getAddresses();
		// Normalize multiple possible backend response shapes into an array
		// Possible shapes: [{...}, ...]  OR { data: { addresses: [...] } } OR { addresses: [...] } OR { data: [...] }
		let payload = resp;
		if (resp == null) payload = [];
		else if (Array.isArray(resp)) payload = resp;
		else if (resp.data && Array.isArray(resp.data.addresses)) payload = resp.data.addresses;
		else if (Array.isArray(resp.addresses)) payload = resp.addresses;
		else if (Array.isArray(resp.data)) payload = resp.data;
		else payload = [];

		setAddresses(payload);
		} catch (err) {
			console.error('Failed to fetch addresses', err);
			toast.error('Failed to load addresses');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetch(); }, [isAuthenticated]);

	const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

	const useMyLocation = () => {
		if (!navigator.geolocation) {
			toast.error('Geolocation is not supported by your browser');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setForm(f => ({ ...f, gps_latitude: String(pos.coords.latitude), gps_longitude: String(pos.coords.longitude) }));
				toast.success('Location captured');
			},
			(err) => {
				console.error('Geolocation error', err);
				toast.error('Failed to get location');
			}
		);
	};

	const handleSave = async () => {
		try {
			// Enforce role-based address type: sellers create warehouse addresses, buyers create business addresses
			const is_warehouse = (user?.userType || user?.user_type) === 'seller';
			const payload = {
				title: form.title,
				full_address: form.address,
				city: form.city,
				postal_code: form.postal_code,
				gps_latitude: form.gps_latitude || undefined,
				gps_longitude: form.gps_longitude || undefined,
				is_warehouse: !!is_warehouse,
			};

			if (editingId) {
				await updateAddress(editingId, payload);
				toast.success('Address updated');
			} else {
				await createAddress(payload);
				toast.success('Address created');
			}
			setForm({ title: '', address: '', city: '', postal_code: '', gps_latitude: '', gps_longitude: '' });
			setEditingId(null);
			await fetch();
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to save address');
		}
	};

	const handleEdit = (addr) => {
		setEditingId(addr.id);
		setForm({
			title: addr.title || '',
			address: addr.fullAddress || addr.address || '',
			city: addr.city || '',
			postal_code: addr.postal_code || addr.postalCode || '',
			gps_latitude: addr.gps_latitude || addr.gpsLatitude || '',
			gps_longitude: addr.gps_longitude || addr.gpsLongitude || '',
		});
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this address?')) return;
		try {
			await deleteAddress(id);
			toast.success('Address deleted');
			fetch();
		} catch (err) {
			toast.error('Failed to delete');
		}
	};

	const handleSetPrimary = async (id) => {
		try {
			await setDefaultAddress(id);
			toast.success('Set as primary');
			fetch();
		} catch (err) {
			console.error('Failed to set primary', err);
			toast.error('Failed to set primary');
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="container">
				<h2>Addresses</h2>
				<p>Please login to manage your addresses.</p>
			</div>
		);
	}

	return (
		<div className="container profile-page">
			<h2>Your Addresses</h2>

			<div className="profile-grid">
				<div className="profile-card">
					<h3>{editingId ? 'Edit Address' : 'Add Address'}</h3>
					<div className="row">
						<label>Title</label>
						<input name="title" value={form.title} onChange={handleChange} />
					</div>
					<div className="row">
						<label>Address</label>
						<input name="address" value={form.address} onChange={handleChange} />
					</div>
					<div className="row">
						<label>City</label>
						<input name="city" value={form.city} onChange={handleChange} />
					</div>
					<div className="row">
						<label>Postal</label>
						<input name="postal_code" value={form.postal_code} onChange={handleChange} />
					</div>
					<div className="row">
						<label>Latitude</label>
						<input name="gps_latitude" value={form.gps_latitude} onChange={handleChange} />
					</div>
					<div className="row">
						<label>Longitude</label>
						<input name="gps_longitude" value={form.gps_longitude} onChange={handleChange} />
					</div>
					<div className="row">
						<label>&nbsp;</label>
						<button className="small-btn ghost" onClick={useMyLocation}>Use my location</button>
					</div>
					<div className="row">
						<label>Type</label>
						<div style={{ color: 'var(--muted)' }}>{(user?.userType || user?.user_type) === 'seller' ? 'Warehouse (seller only)' : 'Business (buyer)'}</div>
					</div>
					<div className="profile-actions">
						<button className="small-btn" onClick={handleSave}>{editingId ? 'Save' : 'Create'}</button>
						{editingId && <button className="small-btn ghost" onClick={() => { setEditingId(null); setForm({ title: '', address: '', city: '', postal_code: '', gps_latitude: '', gps_longitude: '' }); }}>Cancel</button>}
					</div>
				</div>

				<div className="profile-card">
					<h3>Saved Addresses</h3>
					{loading ? <p>Loading...</p> : (
						addresses.length === 0 ? <p>No saved addresses</p> : (
							<div>
								{addresses.map(a => (
									<div key={a.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.04)', padding: '8px 0' }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<div>
												<strong>{a.title || 'Address'}</strong>
												<div style={{ color: 'var(--muted)' }}>{a.city} • {a.postal_code || a.postalCode}</div>
											</div>
											<div style={{ display: 'flex', gap: 8 }}>
													<button className="small-btn copy" onClick={() => { navigator.clipboard?.writeText(a.fullAddress || a.address || a.full_address || ''); toast.success('Copied address'); }}>Copy</button>
													<button className="small-btn ghost" onClick={() => handleEdit(a)}>Edit</button>
													<button className="small-btn" onClick={() => handleDelete(a.id)}>Delete</button>
													{!(a.isPrimary || a.is_primary) ? (
														<button className="small-btn ghost" onClick={() => handleSetPrimary(a.id)}>Set primary</button>
													) : (
														<div style={{ padding: '6px 8px', background: 'var(--muted-bg)', borderRadius: 6 }}>Primary</div>
													)}
												</div>
										</div>
										<div style={{ marginTop: 8, color: 'var(--muted)' }}>{a.fullAddress || a.address || a.full_address}</div>
									</div>
								))}
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
};

export default Addresses;

 