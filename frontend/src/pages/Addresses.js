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
			toast.error('بارگذاری آدرس‌ها با خطا مواجه شد');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetch(); }, [isAuthenticated]);

	const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

	const useMyLocation = () => {
		if (!navigator.geolocation) {
			toast.error('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setForm(f => ({ ...f, gps_latitude: String(pos.coords.latitude), gps_longitude: String(pos.coords.longitude) }));
				toast.success('موقعیت با موفقیت ثبت شد');
			},
			(err) => {
				console.error('Geolocation error', err);
				toast.error('دریافت موقعیت با خطا مواجه شد');
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
				toast.success('آدرس به‌روزرسانی شد');
			} else {
				await createAddress(payload);
				toast.success('آدرس ایجاد شد');
			}
			setForm({ title: '', address: '', city: '', postal_code: '', gps_latitude: '', gps_longitude: '' });
			setEditingId(null);
			await fetch();
		} catch (err) {
			toast.error(err.response?.data?.message || 'ذخیره آدرس با خطا مواجه شد');
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
		if (!window.confirm('آیا از حذف این آدرس مطمئن هستید؟')) return;
		try {
			await deleteAddress(id);
			toast.success('آدرس با موفقیت حذف شد');
			fetch();
		} catch (err) {
			toast.error('حذف آدرس با خطا مواجه شد');
		}
	};

	const handleSetPrimary = async (id) => {
		try {
			await setDefaultAddress(id);
			toast.success('به عنوان آدرس اصلی تنظیم شد');
			fetch();
		} catch (err) {
			console.error('Failed to set primary', err);
			toast.error('تنظیم به عنوان آدرس اصلی با خطا مواجه شد');
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="container">
				<h2>آدرس‌ها</h2>
				<p>لطفا برای مدیریت آدرس‌های خود وارد شوید.</p>
			</div>
		);
	}

	return (
		<div className="container profile-page">
			<h2>آدرس‌های شما</h2>

			<div className="profile-grid">
				<div className="profile-card">
					<h3>{editingId ? 'ویرایش آدرس' : 'افزودن آدرس'}</h3>
					<div className="row">
						<label>عنوان</label>
						<input name="title" value={form.title} onChange={handleChange} />
					</div>
					<div className="row">
						<label>آدرس</label>
						<input name="address" value={form.address} onChange={handleChange} />
					</div>
					<div className="row">
						<label>شهر</label>
						<input name="city" value={form.city} onChange={handleChange} />
					</div>
					<div className="row">
						<label>کد پستی</label>
						<input name="postal_code" value={form.postal_code} onChange={handleChange} />
					</div>
					<div className="row">
						<label>عرض جغرافیایی</label>
						<input name="gps_latitude" value={form.gps_latitude} onChange={handleChange} />
					</div>
					<div className="row">
						<label>طول جغرافیایی</label>
						<input name="gps_longitude" value={form.gps_longitude} onChange={handleChange} />
					</div>
					<div className="row">
						<label>&nbsp;</label>
						<button className="small-btn ghost" onClick={useMyLocation}>استفاده از موقعیت من</button>
					</div>
					<div className="row">
						<label>نوع</label>
						<div style={{ color: 'var(--muted)' }}>{(user?.userType || user?.user_type) === 'seller' ? 'انبار (فقط فروشنده)' : 'کسب‌وکار (خریدار)'}</div>
					</div>
					<div className="profile-actions">
						<button className="small-btn" onClick={handleSave}>{editingId ? 'ذخیره' : 'ایجاد'}</button>
						{editingId && <button className="small-btn ghost" onClick={() => { setEditingId(null); setForm({ title: '', address: '', city: '', postal_code: '', gps_latitude: '', gps_longitude: '' }); }}>انصراف</button>}
					</div>
				</div>

				<div className="profile-card">
					<h3>آدرس‌های ذخیره شده</h3>
					{loading ? <p>در حال بارگذاری...</p> : (
					  addresses.length === 0 ? <p>هیچ آدرسی ذخیره نشده است</p> : (
							<div>
								{addresses.map(a => (
									<div key={a.id} style={{ borderBottom: '1px solid rgba(11,37,69,0.04)', padding: '8px 0' }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
											<div>
												<strong>{a.title || 'Address'}</strong>
												<div style={{ color: 'var(--muted)' }}>{a.city} • {a.postal_code || a.postalCode}</div>
											</div>
											<div style={{ display: 'flex', gap: 8 }}>
													<button className="small-btn copy" onClick={() => { navigator.clipboard?.writeText(a.fullAddress || a.address || a.full_address || ''); toast.success('کپی شد'); }}>کپی</button>
													<button className="small-btn ghost" onClick={() => handleEdit(a)}>ویرایش</button>
													<button className="small-btn" onClick={() => handleDelete(a.id)}>حذف</button>
													{!(a.isPrimary || a.is_primary) ? (
													  <button className="small-btn ghost" onClick={() => handleSetPrimary(a.id)}>تنظیم به عنوان اصلی</button>
													) : (
													  <div style={{ padding: '6px 8px', background: 'var(--muted-bg)', borderRadius: 6 }}>اصلی</div>
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

 