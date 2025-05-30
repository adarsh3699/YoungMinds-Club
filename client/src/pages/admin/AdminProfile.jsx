import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
	CameraIcon,
	UserIcon,
	EnvelopeIcon,
	ShieldCheckIcon,
	ClockIcon,
	ArrowPathIcon,
	ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
	const { user, updateUserInfo } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [adminProfile, setAdminProfile] = useState(null);
	const [adminLogs, setAdminLogs] = useState([]);
	const [otherAdmins, setOtherAdmins] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const fileInputRef = useRef(null);

	useEffect(() => {
		const fetchProfileData = async () => {
			setLoading(true);
			try {
				// Get admin profile data
				const profileResponse = await axios.get('/admin/profile');
				if (profileResponse.data.success) {
					setAdminProfile(profileResponse.data.profile);
				}

				// Get admin action logs
				const logsResponse = await axios.get('/admin/logs');
				if (logsResponse.data.success) {
					setAdminLogs(logsResponse.data.logs);
				}

				// Get other admins
				const adminsResponse = await axios.get('/admin/team');
				if (adminsResponse.data.success) {
					setOtherAdmins(adminsResponse.data.team);
				}
			} catch (error) {
				console.error('Error fetching profile data:', error);
				setError('Failed to load profile data. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	}, []);

	const handleProfilePictureClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('profilePicture', file);

		try {
			const response = await axios.post('/admin/profile/picture', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.data.success) {
				setAdminProfile({
					...adminProfile,
					profilePicture: response.data.profilePicture,
				});
			}
		} catch (error) {
			console.error('Error uploading profile picture:', error);
			setError('Failed to upload profile picture. Please try again.');
		}
	};

	const refreshLogs = async () => {
		setRefreshing(true);
		try {
			const logsResponse = await axios.get('/admin/logs');
			if (logsResponse.data.success) {
				setAdminLogs(logsResponse.data.logs);
			}
		} catch (error) {
			console.error('Error refreshing logs:', error);
			setError('Failed to refresh logs. Please try again.');
		} finally {
			setRefreshing(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-64">
					<div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
					<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 ml-4">Loading profile...</h2>
				</div>
			</div>
		);
	}

	if (!adminProfile) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> Failed to load profile data.</span>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{error && (
				<div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> {error}</span>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: Profile Info and Admin Team */}
				<div className="lg:col-span-1">
					{/* Profile Card */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
						<div className="flex flex-col items-center">
							<div className="relative group mb-4">
								<div
									className="h-28 w-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
									onClick={handleProfilePictureClick}
								>
									{adminProfile.profilePicture ? (
										<img
											src={adminProfile.profilePicture}
											alt="Profile"
											className="h-full w-full object-cover"
										/>
									) : (
										<span className="text-5xl text-gray-400 dark:text-gray-500">
											{adminProfile.name ? adminProfile.name.charAt(0) : 'A'}
										</span>
									)}
									<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
										<CameraIcon className="h-10 w-10 text-white" />
									</div>
								</div>
								<input
									type="file"
									ref={fileInputRef}
									className="hidden"
									accept="image/*"
									onChange={handleFileChange}
								/>
							</div>

							<h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
								{adminProfile.name}
							</h1>

							<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mb-3">
								<ShieldCheckIcon className="h-4 w-4 mr-1" />
								Administrator
							</div>

							<div className="w-full space-y-3 mt-2">
								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
									<span>{adminProfile.email}</span>
								</div>

								<div className="flex items-center text-gray-700 dark:text-gray-300">
									<ClockIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
									<span>Joined {new Date(adminProfile.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Admin Team */}
					{otherAdmins.length > 0 && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
							<h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Admin Team</h2>

							<div className="space-y-4">
								{otherAdmins.map((admin) => (
									<div
										key={admin._id}
										className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
									>
										{admin.profilePicture ? (
											<img
												src={admin.profilePicture}
												alt={admin.name}
												className="h-10 w-10 rounded-full mr-3 object-cover"
											/>
										) : (
											<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
												<span className="text-gray-500 dark:text-gray-400">
													{admin.name.charAt(0)}
												</span>
											</div>
										)}

										<div>
											<h3 className="font-medium text-gray-800 dark:text-gray-200">
												{admin.name} {admin._id === user._id && '(You)'}
											</h3>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Right Column: Admin Logs */}
				<div className="lg:col-span-2">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Action Logs</h2>

							<button
								onClick={refreshLogs}
								className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
								disabled={refreshing}
							>
								<ArrowPathIcon className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
								Refresh Logs
							</button>
						</div>

						{adminLogs.length === 0 ? (
							<div className="text-center py-12 text-gray-500 dark:text-gray-400">
								<ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
								<p>No admin action logs available.</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
									<thead className="bg-gray-50 dark:bg-gray-700">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
												Time
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
												Action
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
												Details
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
												Status
											</th>
										</tr>
									</thead>
									<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
										{adminLogs.map((log) => (
											<tr key={log.id || `log-${log.timestamp}`}>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
													{new Date(log.timestamp).toLocaleString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															log.action === 'create'
																? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
																: log.action === 'update'
																? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
																: log.action === 'delete'
																? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
																: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
														}`}
													>
														{log.action.charAt(0).toUpperCase() + log.action.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
													<span className="font-medium">{log.targetType || 'Action'}</span>:{' '}
													{log.description || log.details || 'No details available'}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															log.status === 'success'
																? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
																: log.status === 'error'
																? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
																: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
														}`}
													>
														{log.status
															? log.status.charAt(0).toUpperCase() + log.status.slice(1)
															: 'Unknown'}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}

						{adminLogs.length > 10 && (
							<div className="mt-4 text-right">
								<a href="#" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
									View All Logs
								</a>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
