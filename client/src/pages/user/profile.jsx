import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ProfileHeader, XPSection, BadgeCollection, OrganizerApplication } from '../../components/user/profile';

const Profile = () => {
	const { user, updateUserInfo } = useAuth();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [xpHistory, setXPHistory] = useState([]);
	const [badges, setBadges] = useState([]);
	const [editMode, setEditMode] = useState(false);
	const [formValues, setFormValues] = useState({
		name: '',
		email: '',
		college: '',
	});
	const [applyingForOrganizer, setApplyingForOrganizer] = useState(false);
	const [organizerApplication, setOrganizerApplication] = useState({
		organizationName: '',
		reason: '',
		experience: '',
		socialLinks: '',
	});

	useEffect(() => {
		const fetchProfileData = async () => {
			setLoading(true);
			try {
				// Get user profile data
				const profileResponse = await axios.get('/user/profile');
				if (profileResponse?.data?.success) {
					const profileData = profileResponse.data.profile || {};
					setUserProfile(profileData);
					setFormValues({
						name: profileData?.name || '',
						email: profileData?.email || '',
						college: profileData?.college || '',
					});
				} else {
					// Create default profile if response is not successful
					const defaultProfile = { name: user?.name || '', email: user?.email || '' };
					setUserProfile(defaultProfile);
					setFormValues({
						name: defaultProfile.name,
						email: defaultProfile.email,
						college: '',
					});
				}

				// Get XP history
				const xpResponse = await axios.get('/user/xp-history');
				// console.log('XP History Response:', xpResponse.data); // Debug log
				if (xpResponse?.data?.success) {
					setXPHistory(xpResponse.data.xpHistory || []);
				} else {
					console.log('XP History failed:', xpResponse.data); // Debug log
					setXPHistory([]);
				}

				// Get badges collection
				const badgesResponse = await axios.get('/user/badges');
				if (badgesResponse?.data?.success) {
					setBadges(badgesResponse.data.badges || []);
				} else {
					setBadges([]);
				}
			} catch (error) {
				console.error('Error fetching profile data:', error);
				setError('Failed to load profile data. Please try again.');

				// Set defaults in case of error
				const defaultProfile = { name: user?.name || '', email: user?.email || '' };
				setUserProfile(defaultProfile);
				setFormValues({
					name: defaultProfile.name,
					email: defaultProfile.email,
					college: '',
				});
				setXPHistory([]);
				setBadges([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	}, [user]);

	const toggleEditMode = () => {
		if (editMode) {
			// Reset form values when canceling edit
			setFormValues({
				name: userProfile?.name || '',
				email: userProfile?.email || '',
				college: userProfile?.college || '',
			});
		}
		setEditMode(!editMode);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const handleApplicationChange = (e) => {
		const { name, value } = e.target;
		setOrganizerApplication({
			...organizerApplication,
			[name]: value,
		});
	};

	const saveProfile = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const response = await axios.put('/user/profile', formValues);

			if (response.data.success) {
				setUserProfile({
					...userProfile,
					...formValues,
				});
				// Update auth context if available
				if (updateUserInfo) {
					updateUserInfo({
						name: formValues.name,
						email: formValues.email,
					});
				}
				setEditMode(false);
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			setError('Failed to update profile. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const submitOrganizerApplication = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const response = await axios.post('/user/apply-organizer', organizerApplication);

			if (response.data.success) {
				setApplyingForOrganizer(false);
				// Show success message or notification
			}
		} catch (error) {
			console.error('Error submitting application:', error);
			setError('Failed to submit organizer application. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('profilePicture', file);

		setSaving(true);
		try {
			const response = await axios.post('/user/profile/picture', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.data.success) {
				setUserProfile({
					...userProfile,
					profilePicture: response.data.profilePicture,
				});
			}
		} catch (error) {
			console.error('Error uploading profile picture:', error);
			setError('Failed to upload profile picture. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	// Badge styling helper
	const getBadgeInfo = (badgeName) => {
		switch (badgeName) {
			case 'Newbie':
				return { color: 'ym-bg-amber-100 ym-text-yellow-700', icon: '🌱' };
			case 'Regular':
				return { color: 'ym-bg-success bg-opacity-10 ym-text-success', icon: '🌟' };
			case 'Champ':
				return { color: 'ym-bg-orange-400 text-white', icon: '🏆' };
			case 'Veteran':
				return { color: 'ym-bg-amber-400 text-white', icon: '🔥' };
			case 'Master':
				return { color: 'gradient-bg text-white', icon: '👑' };
			default:
				return { color: 'ym-bg-card ym-text-card border ym-border-card', icon: '❓' };
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen ym-features-bg">
				<div className="container mx-auto px-4 py-8">
					<div className="flex justify-center items-center h-64">
						<div className="w-12 h-12 border-t-4 border-amber-400 border-solid rounded-full animate-spin mb-4"></div>
						<h2 className="text-xl font-semibold ym-text-secondary ml-4">Loading profile...</h2>
					</div>
				</div>
			</div>
		);
	}

	if (!userProfile) {
		return (
			<div className="min-h-screen ym-features-bg">
				<div className="container mx-auto px-4 py-8">
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
						<strong className="font-bold">Error!</strong>
						<span className="block sm:inline"> Failed to load profile data.</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-8 mt-12 max-w-7xl">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in">
						<strong className="font-bold">Error!</strong>
						<span className="block sm:inline"> {error}</span>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column: Profile Info */}
					<div className="lg:col-span-2">
						<ProfileHeader
							userProfile={userProfile}
							editMode={editMode}
							formValues={formValues}
							saving={saving}
							onToggleEditMode={toggleEditMode}
							onInputChange={handleInputChange}
							onSaveProfile={saveProfile}
							onFileChange={handleFileChange}
							getBadgeInfo={getBadgeInfo}
						/>

						<XPSection userProfile={userProfile} xpHistory={xpHistory} />
					</div>

					{/* Right Column: Badge Collection */}
					<div className="flex flex-col h-fit">
						<BadgeCollection badges={badges} getBadgeInfo={getBadgeInfo} />
					</div>
				</div>

				{/* Full Width Organizer Application */}
				<div className="mt-8 mb-50">
					<OrganizerApplication
						applyingForOrganizer={applyingForOrganizer}
						organizerApplication={organizerApplication}
						saving={saving}
						onApplicationChange={handleApplicationChange}
						onSubmitApplication={submitOrganizerApplication}
						onToggleApplication={() => setApplyingForOrganizer(!applyingForOrganizer)}
					/>
				</div>
			</div>
		</div>
	);
};

export default Profile;
