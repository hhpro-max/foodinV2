
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { updateUserProfile } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/profile.css';

const Profile = () => {
	const { user } = useAuth();
	const { updateUser } = useAuth();
	const [editing, setEditing] = useState({});
	const [form, setForm] = useState({
		first_name: user?.profile?.firstName || user?.profile?.first_name || '',
		last_name: user?.profile?.lastName || user?.profile?.last_name || '',
		email: user?.profile?.email || '',
		national_id: user?.naturalPerson?.nationalId || user?.naturalPerson?.national_id || '',
		economic_code: user?.legalPerson?.economicCode || user?.legalPerson?.economic_code || '',
		company_name: user?.legalPerson?.companyName || user?.legalPerson?.company_name || '',
		user_type: user?.userType || user?.user_type || 'natural',
	});

	if (!user) {
		return (
			<div className="container">
				<h2>Profile</h2>
				<p>Please login to view your profile.</p>
				<Link to="/auth" className="btn btn-primary">Login</Link>
			</div>
		);
	}

	return (
		<div className="container profile-page">
				<h2>Your Profile</h2>

				  <div className="profile-grid">
					<div className="profile-card">
					  <h3>Account</h3>
					  <p><strong>ID:</strong> {user.id} <button className="small-btn" onClick={() => { navigator.clipboard?.writeText(user.id); toast.success('Copied ID'); }}>Copy</button></p>
					  <p><strong>Phone:</strong> {user.phone} <button className="small-btn" onClick={() => { navigator.clipboard?.writeText(user.phone); toast.success('Copied phone'); }}>Copy</button></p>
					  <p><strong>Type:</strong> {user.userType || user.user_type || 'N/A'}</p>
					  <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
					  <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
					  <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
					  <p><strong>Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</p>
					</div>

							<div className="profile-card editable">
								<h3>Profile</h3>
								<div className="row">
									<label>First name</label>
									{editing.first_name ? (
										<div className="edit-row">
											<input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
											<button className="small-btn" onClick={async () => {
												try {
													const resp = await updateUserProfile({ first_name: form.first_name });
													toast.success('First name updated');
													updateUser(resp?.data?.user || resp?.user || resp);
													setEditing({...editing, first_name: false});
												} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
											}}>Save</button>
											<button className="small-btn" onClick={() => setEditing({...editing, first_name: false})}>Cancel</button>
										</div>
									) : (
										<div className="view-row">
											<span>{user.profile?.firstName || user.profile?.first_name || 'N/A'}</span>
											<button className="small-btn" onClick={() => setEditing({...editing, first_name: true})}>Edit</button>
										</div>
									)}
								</div>

								<div className="row">
									<label>Last name</label>
									{editing.last_name ? (
										<div className="edit-row">
											<input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
											<button className="small-btn" onClick={async () => {
												try {
													const resp = await updateUserProfile({ last_name: form.last_name });
													toast.success('Last name updated');
													updateUser(resp?.data?.user || resp?.user || resp);
													setEditing({...editing, last_name: false});
												} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
											}}>Save</button>
											<button className="small-btn" onClick={() => setEditing({...editing, last_name: false})}>Cancel</button>
										</div>
									) : (
										<div className="view-row">
											<span>{user.profile?.lastName || user.profile?.last_name || 'N/A'}</span>
											<button className="small-btn" onClick={() => setEditing({...editing, last_name: true})}>Edit</button>
										</div>
									)}
								</div>

								<div className="row">
									<label>Email</label>
									{editing.email ? (
										<div className="edit-row">
											<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
											<button className="small-btn" onClick={async () => {
												try {
													const resp = await updateUserProfile({ email: form.email });
													toast.success('Email updated');
													updateUser(resp?.data?.user || resp?.user || resp);
													setEditing({...editing, email: false});
												} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
											}}>Save</button>
											<button className="small-btn" onClick={() => setEditing({...editing, email: false})}>Cancel</button>
										</div>
									) : (
										<div className="view-row">
											<span>{user.profile?.email || 'N/A'}</span>
											<button className="small-btn" onClick={() => setEditing({...editing, email: true})}>Edit</button>
										</div>
									)}
								</div>

								<p><strong>Customer Code:</strong> {user.profile?.customerCode || user.profile?.customer_code || 'N/A'}</p>
							</div>

							<div className="profile-card editable">
								<h3>Natural Person</h3>
								{user.naturalPerson ? (
									<>
										<p><strong>ID:</strong> {user.naturalPerson.id} <button className="small-btn" onClick={() => { navigator.clipboard?.writeText(user.naturalPerson.id); toast.success('Copied ID'); }}>Copy</button></p>
										<div className="row">
											<label>National ID</label>
											{editing.national_id ? (
												<div className="edit-row">
													<input value={form.national_id} onChange={e => setForm({...form, national_id: e.target.value})} />
													<button className="small-btn" onClick={async () => {
														try {
															const resp = await updateUserProfile({ national_id: form.national_id });
															toast.success('National ID updated');
															updateUser(resp?.data?.user || resp?.user || resp);
															setEditing({...editing, national_id: false});
														} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
													}}>Save</button>
													<button className="small-btn" onClick={() => setEditing({...editing, national_id: false})}>Cancel</button>
												</div>
											) : (
												<div className="view-row">
													<span>{user.naturalPerson.nationalId || user.naturalPerson.national_id || 'N/A'}</span>
													<button className="small-btn" onClick={() => setEditing({...editing, national_id: true})}>Edit</button>
												</div>
											)}
										</div>
										<p><strong>Created:</strong> {user.naturalPerson.createdAt ? new Date(user.naturalPerson.createdAt).toLocaleString() : 'N/A'}</p>
									</>
								) : (
									<p>Not provided</p>
								)}
							</div>

							<div className="profile-card editable">
								<h3>Legal Person</h3>
								{user.legalPerson ? (
									<>
										<p><strong>ID:</strong> {user.legalPerson.id} <button className="small-btn" onClick={() => { navigator.clipboard?.writeText(user.legalPerson.id); toast.success('Copied ID'); }}>Copy</button></p>
										<div className="row">
											<label>Economic Code</label>
											{editing.economic_code ? (
												<div className="edit-row">
													<input value={form.economic_code} onChange={e => setForm({...form, economic_code: e.target.value})} />
													<button className="small-btn" onClick={async () => {
														try {
															const resp = await updateUserProfile({ economic_code: form.economic_code });
															toast.success('Economic code updated');
															updateUser(resp?.data?.user || resp?.user || resp);
															setEditing({...editing, economic_code: false});
														} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
													}}>Save</button>
													<button className="small-btn" onClick={() => setEditing({...editing, economic_code: false})}>Cancel</button>
												</div>
											) : (
												<div className="view-row">
													<span>{user.legalPerson.economicCode || user.legalPerson.economic_code || 'N/A'}</span>
													<button className="small-btn" onClick={() => setEditing({...editing, economic_code: true})}>Edit</button>
												</div>
											)}
										</div>

										<div className="row">
											<label>Company Name</label>
											{editing.company_name ? (
												<div className="edit-row">
													<input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
													<button className="small-btn" onClick={async () => {
														try {
															const resp = await updateUserProfile({ company_name: form.company_name });
															toast.success('Company name updated');
															updateUser(resp?.data?.user || resp?.user || resp);
															setEditing({...editing, company_name: false});
														} catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
													}}>Save</button>
													<button className="small-btn" onClick={() => setEditing({...editing, company_name: false})}>Cancel</button>
												</div>
											) : (
												<div className="view-row">
													<span>{user.legalPerson.companyName || user.legalPerson.company_name || 'N/A'}</span>
													<button className="small-btn" onClick={() => setEditing({...editing, company_name: true})}>Edit</button>
												</div>
											)}
										</div>
									</>
								) : (
									<p>Not provided</p>
								)}
							</div>
				</div>
		</div>
	);
};

export default Profile;
