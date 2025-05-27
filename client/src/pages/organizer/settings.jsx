import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ShieldCheckIcon, CogIcon, KeyIcon } from '@heroicons/react/24/outline';
import Switch from '../../components/common/Switch';

const Settings = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });

	const [settings, setSettings] = useState({
		privacy: {
			showEmail: false,
			showPhone: false,
			publicProfile: true,
		},
		security: {
			twoFactorAuth: false,
		},
	});

	useEffect(() => {
		const fetchSettings = async () => {
			setLoading(true);
			try {
				// This endpoint would need to be implemented on the backend
				// For now, we'll just use default values after a delay
				setTimeout(() => {
					setLoading(false);
				}, 1000);

				// When the endpoint exists, uncomment this code:
				/*
        const response = await axios.get('/organizer/settings');
        if (response.data.success) {
          setSettings(response.data.settings);
        }
        */
			} catch (error) {
				console.error('Error fetching settings:', error);
				setMessage({
					type: 'error',
					text: 'Failed to load settings. Please try again.',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, []);

	const handleSave = async () => {
		setSaving(true);
		setMessage({ type: '', text: '' });

		try {
			// This endpoint would need to be implemented on the backend
			// For now, we'll just simulate a successful save
			setTimeout(() => {
				setMessage({
					type: 'success',
					text: 'Settings saved successfully!',
				});
				setSaving(false);
			}, 1000);

			// When the endpoint exists, uncomment this code:
			/*
      const response = await axios.put('/organizer/settings', settings);
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!'
        });
      }
      */
		} catch (error) {
			console.error('Error saving settings:', error);
			setMessage({
				type: 'error',
				text: 'Failed to save settings. Please try again.',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleToggle = (category, setting) => {
		setSettings((prev) => ({
			...prev,
			[category]: {
				...prev[category],
				[setting]: !prev[category][setting],
			},
		}));
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'var(--background)' }}>
				<div className="flex justify-center items-center h-64">
					<div
						className="w-12 h-12 border-t-4 border-solid rounded-full animate-spin mb-4"
						style={{ borderColor: 'var(--ring)' }}
					></div>
					<h2 className="text-xl font-semibold ym-text-primary ml-4">Loading settings...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'var(--background-secondary)' }}>
			<div
				className="ym-bg-card rounded-xl shadow-lg overflow-hidden my-8 border ym-border-card"
				style={{ backgroundColor: 'var(--background)' }}
			>
				{/* Enhanced Header with YoungMinds Gradient */}
				<div className="gradient-bg px-6 py-6">
					<div className="flex items-center">
						<div className="ym-bg-white-20 p-3 rounded-xl mr-4 backdrop-blur-sm">
							<CogIcon className="h-6 w-6 ym-text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold ym-text-white flex items-center">Organizer Settings</h1>
							<p className="ym-text-white-80 text-sm font-medium">
								Manage your privacy and security preferences
							</p>
						</div>
					</div>
				</div>

				{/* Message display */}
				{message.text && (
					<div
						className={`mx-6 mt-4 p-4 rounded-lg border ym-bg-card ${
							message.type === 'success'
								? 'ym-bg-success/10 border-green-200 ym-text-success'
								: 'bg-red-50 border-red-200 text-red-700'
						}`}
					>
						<div className="flex items-center">
							{message.type === 'success' ? (
								<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							) : (
								<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							)}
							{message.text}
						</div>
					</div>
				)}
				<div className="p-8" style={{ backgroundColor: 'var(--background)' }}>
					{/* Privacy Settings */}
					<div className="mb-8">
						<h2 className="text-xl font-bold ym-text-primary mb-6 flex items-center">
							<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
								<ShieldCheckIcon className="h-5 w-5 ym-text-yellow-600" />
							</div>
							Privacy Settings
						</h2>

						<div className="ym-bg-card rounded-xl p-6 shadow-lg border ym-border-card">
							<div className="space-y-6">
								<div className="flex items-center justify-between p-4 ym-bg-amber-100/50 rounded-lg">
									<div>
										<label className="text-base font-semibold ym-text-primary">
											Show Email to Attendees
										</label>
										<p className="text-sm ym-text-secondary mt-1">
											Allow event attendees to see your email address
										</p>
									</div>
									<Switch
										enabled={settings.privacy.showEmail}
										onChange={() => handleToggle('privacy', 'showEmail')}
										name="showEmail"
										srLabel="Show Email to Attendees"
									/>
								</div>

								<div className="flex items-center justify-between p-4 ym-bg-amber-100/50 rounded-lg">
									<div>
										<label className="text-base font-semibold ym-text-primary">
											Show Phone Number
										</label>
										<p className="text-sm ym-text-secondary mt-1">
											Display your phone number on your organizer profile
										</p>
									</div>
									<Switch
										enabled={settings.privacy.showPhone}
										onChange={() => handleToggle('privacy', 'showPhone')}
										name="showPhone"
										srLabel="Show Phone Number"
									/>
								</div>

								<div className="flex items-center justify-between p-4 ym-bg-amber-100/50 rounded-lg">
									<div>
										<label className="text-base font-semibold ym-text-primary">
											Public Organizer Profile
										</label>
										<p className="text-sm ym-text-secondary mt-1">
											Make your organizer profile visible to all users
										</p>
									</div>
									<Switch
										enabled={settings.privacy.publicProfile}
										onChange={() => handleToggle('privacy', 'publicProfile')}
										name="publicProfile"
										srLabel="Public Organizer Profile"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Security Settings */}
					<div className="mb-8">
						<h2 className="text-xl font-bold ym-text-primary mb-6 flex items-center">
							<div className="ym-bg-amber-100 p-2 rounded-lg mr-3">
								<KeyIcon className="h-5 w-5 ym-text-yellow-600" />
							</div>
							Security Settings
						</h2>

						<div className="ym-bg-card rounded-xl p-6 shadow-lg border ym-border-card">
							<div className="space-y-6">
								<div className="flex items-center justify-between p-4 ym-bg-amber-100/50 rounded-lg">
									<div>
										<label className="text-base font-semibold ym-text-primary">
											Two-Factor Authentication
										</label>
										<p className="text-sm ym-text-secondary mt-1">
											Add an extra layer of security to your account
										</p>
									</div>
									<Switch
										enabled={settings.security.twoFactorAuth}
										onChange={() => handleToggle('security', 'twoFactorAuth')}
										name="twoFactorAuth"
										srLabel="Two-Factor Authentication"
									/>
								</div>

								<div className="pt-4 border-t ym-border-card">
									<button
										type="button"
										className="px-6 py-3 ym-bg-amber-400 ym-text-white font-semibold rounded-lg hover:ym-bg-amber-400:hover transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
										style={{ '--tw-ring-color': 'var(--ring)' }}
									>
										Change Password
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Save Button */}
					<div className="flex justify-end pt-6 border-t ym-border-card">
						<button
							onClick={handleSave}
							disabled={saving}
							className={`px-8 py-3 gradient-bg ym-text-white text-base font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
								saving ? 'opacity-70 cursor-not-allowed transform-none' : ''
							}`}
							style={{ '--tw-ring-color': 'var(--ring)' }}
						>
							{saving ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 ym-text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Saving...
								</span>
							) : (
								<span className="flex items-center">
									<CogIcon className="w-5 h-5 mr-2" />
									Save Settings
								</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
