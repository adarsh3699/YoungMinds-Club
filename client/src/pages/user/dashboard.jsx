import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import EventCard from '../../components/organizer/EventCard';
import XPProgressBar from '../../components/user/XPProgressBar';
import { Tabs, SelectInput } from '../../components/common';

const UserDashboard = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [events, setEvents] = useState([]);
	const [recommendedEvents, setRecommendedEvents] = useState([]);
	const [userProfile, setUserProfile] = useState(null);
	const [announcements, setAnnouncements] = useState([]);

	// Filters and search state
	const [searchQuery, setSearchQuery] = useState('');
	const [category, setCategory] = useState('');
	const [city, setCity] = useState('');
	const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
	const [tag, setTag] = useState('');

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Categories and tag options
	const categories = ['Technology', 'Business', 'Education', 'Arts', 'Science', 'Music', 'Sports', 'Other'];
	const popularTags = ['MUN', 'Hackathon', 'Workshop', 'Conference', 'Networking', 'Career'];

	// Indian States and Union Territories
	const indianStates = [
		'Andhra Pradesh',
		'Arunachal Pradesh',
		'Assam',
		'Bihar',
		'Chhattisgarh',
		'Goa',
		'Gujarat',
		'Haryana',
		'Himachal Pradesh',
		'Jharkhand',
		'Karnataka',
		'Kerala',
		'Madhya Pradesh',
		'Maharashtra',
		'Manipur',
		'Meghalaya',
		'Mizoram',
		'Nagaland',
		'Odisha',
		'Punjab',
		'Rajasthan',
		'Sikkim',
		'Tamil Nadu',
		'Telangana',
		'Tripura',
		'Uttar Pradesh',
		'Uttarakhand',
		'West Bengal',
		'Andaman and Nicobar Islands',
		'Chandigarh',
		'Dadra and Nagar Haveli and Daman and Diu',
		'Delhi',
		'Jammu and Kashmir',
		'Ladakh',
		'Lakshadweep',
		'Puducherry',
	];

	// Convert arrays to options format for SelectInput
	const categoryOptions = [
		{ value: '', label: 'All Categories' },
		...categories.map((cat) => ({ value: cat, label: cat })),
	];

	const stateOptions = [
		{ value: '', label: 'All States' },
		...indianStates.map((state) => ({ value: state, label: state })),
	];

	const tagOptions = [{ value: '', label: 'All Tags' }, ...popularTags.map((tag) => ({ value: tag, label: tag }))];

	// Load user profile and events
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Get user profile with XP and badge
				const profileResponse = await axios.get('/user/dashboard');
				setUserProfile(profileResponse.data.profile);

				// Get recommended events
				const recommendedResponse = await axios.get('/events/recommended');
				setRecommendedEvents(recommendedResponse.data.events);

				// Get all events with default filters
				await fetchEvents();

				// Fetch active announcements
				const announcementsResponse = await axios.get('/user/announcements');
				if (announcementsResponse.data.success) {
					setAnnouncements(announcementsResponse.data.announcements);
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				setError('Failed to load dashboard. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Fetch events with filters
	const fetchEvents = async (page = 1) => {
		try {
			const queryParams = new URLSearchParams();

			// Add filters to query params
			if (searchQuery) queryParams.append('search', searchQuery);
			if (category) queryParams.append('category', category);
			if (city) queryParams.append('city', city);
			if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
			if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
			if (tag) queryParams.append('tag', tag);

			// Add pagination
			queryParams.append('page', page);
			queryParams.append('limit', 9); // 9 events per page

			const response = await axios.get(`/events?${queryParams.toString()}`);

			setEvents(response.data.events);
			setCurrentPage(response.data.currentPage);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			console.error('Error fetching events:', error);
			setError('Failed to load events. Please try again.');
		}
	};

	// Handle search and filter changes
	const handleSearch = (e) => {
		e.preventDefault();
		setCurrentPage(1); // Reset to first page
		fetchEvents(1);
	};

	// Reset all filters
	const handleResetFilters = () => {
		setSearchQuery('');
		setCategory('');
		setCity('');
		setDateRange({ startDate: '', endDate: '' });
		setTag('');
		setCurrentPage(1);
		fetchEvents(1);
	};

	// Handle pagination
	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
			fetchEvents(newPage);
		}
	};

	// Handle saving/unsaving event
	const handleSaveToggle = (eventId, isSaved) => {
		// Update the UI to reflect saved state
		setEvents(events.map((event) => (event._id === eventId ? { ...event, isSaved } : event)));

		setRecommendedEvents(recommendedEvents.map((event) => (event._id === eventId ? { ...event, isSaved } : event)));
	};

	// Badge mapping for badge icons and colors
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

	// Announcement type styling
	const getAnnouncementStyle = (type) => {
		switch (type) {
			case 'info':
				return 'ym-bg-amber-100 border-l-amber-400 ym-text-yellow-700';
			case 'warning':
				return 'ym-bg-amber-100 border-l-amber-600 ym-text-yellow-700';
			case 'success':
				return 'ym-bg-success bg-opacity-10 border-l-green-400 ym-text-success';
			case 'error':
				return 'bg-red-50 border-l-red-400 text-red-700';
			default:
				return 'ym-bg-amber-100 border-l-amber-400 ym-text-yellow-700';
		}
	};

	// Show loading state
	if (loading) {
		return (
			<div className="min-h-screen ym-features-bg">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col items-center justify-center h-64">
						<div
							className="w-12 h-12 border-t-4 border-solid rounded-full animate-spin mb-4"
							style={{ borderTopColor: 'var(--ring)' }}
						></div>
						<h2 className="text-xl font-semibold ym-text-secondary">Loading your dashboard...</h2>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="min-h-screen ym-features-bg">
				<div className="container mx-auto px-4 py-8">
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
						<strong className="font-bold">Error!</strong>
						<span className="block sm:inline"> {error}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="container mx-auto px-4 py-8 mt-12">
				{/* Announcements Section */}
				{announcements.length > 0 && (
					<div className="mb-6">
						{announcements.map((announcement) => (
							<div
								key={announcement._id}
								className={`mb-4 p-4 border-l-4 rounded-lg shadow-sm animate-fade-in ${getAnnouncementStyle(
									announcement.type
								)}`}
							>
								<div className="flex justify-between items-start">
									<h3 className="font-bold text-lg">{announcement.title}</h3>
									<span className="text-xs opacity-70">
										{new Date(announcement.createdAt).toLocaleDateString()}
									</span>
								</div>
								<p className="mt-2">{announcement.message}</p>
							</div>
						))}
					</div>
				)}

				{/* User Profile Section */}
				{userProfile && (
					<div className="ym-bg-card p-6 rounded-xl shadow-lg mb-8 border ym-border-card animate-fade-in">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
							<div>
								<h1 className="text-2xl font-bold ym-text-primary">Welcome back, {user?.name}!</h1>
								<p className="ym-text-secondary">
									Find exciting events and earn XP to level up your profile!
								</p>
							</div>

							<div className="mt-4 md:mt-0 flex items-center">
								<div className="mr-4 text-right">
									<p className="text-sm ym-text-muted">Current Level</p>
									<p className="text-xl font-bold ym-text-yellow-600">{userProfile.badge}</p>
								</div>
								<div className="ym-bg-amber-100 p-2 rounded-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-8 w-8 ym-text-yellow-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
										/>
									</svg>
								</div>
							</div>
						</div>

						<XPProgressBar xp={userProfile.xp} />

						{userProfile.streakCount > 0 && (
							<div className="mt-4 ym-bg-amber-100 rounded-lg p-3 flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 ym-text-yellow-600 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="ym-text-yellow-700">
									{userProfile.streakCount} weekend streak! Keep attending events to earn bonus XP!
								</span>
							</div>
						)}
					</div>
				)}

				{/* Events Section with Tabs */}
				<Tabs
					tabs={[
						{
							key: 'all',
							label: 'All Events',
							content: (
								<>
									{/* Search and Filters Section */}
									<div className="ym-bg-card p-6 rounded-xl shadow-lg mb-8 border ym-border-card">
										<h2 className="text-xl font-semibold ym-text-primary mb-4">Find Events</h2>

										<form onSubmit={handleSearch} className="space-y-4">
											<div className="flex flex-col md:flex-row gap-4">
												<div className="flex-grow">
													<input
														type="text"
														placeholder="Search events, tags or cities..."
														value={searchQuery}
														onChange={(e) => setSearchQuery(e.target.value)}
														className="w-full p-3 border ym-border-card rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
													/>
												</div>

												<button
													type="submit"
													className="gradient-bg text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
												>
													Search
												</button>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<SelectInput
													id="category-filter"
													name="category"
													value={category}
													onChange={(e) => setCategory(e.target.value)}
													options={categoryOptions}
													placeholder="All Categories"
													className="mb-0"
												/>

												<SelectInput
													id="state-filter"
													name="city"
													value={city}
													onChange={(e) => setCity(e.target.value)}
													options={stateOptions}
													placeholder="All States"
													className="mb-0"
												/>

												<SelectInput
													id="tag-filter"
													name="tag"
													value={tag}
													onChange={(e) => setTag(e.target.value)}
													options={tagOptions}
													placeholder="All Tags"
													className="mb-0"
												/>
											</div>

											<div className="flex justify-end">
												<button
													type="button"
													onClick={handleResetFilters}
													className="ym-text-yellow-600 hover:ym-text-yellow-700 transition-colors mr-4 font-medium"
												>
													Reset Filters
												</button>
											</div>
										</form>
									</div>

									{/* Events Grid */}
									<div className="mb-8">
										<h2 className="text-2xl font-bold ym-text-primary mb-6">Available Events</h2>

										{events.length === 0 ? (
											<div className="ym-bg-card p-8 rounded-xl shadow-lg text-center border ym-border-card">
												<div className="ym-bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
													<svg
														className="w-8 h-8 ym-text-yellow-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
														/>
													</svg>
												</div>
												<p className="ym-text-secondary text-lg">
													No events found matching your criteria.
												</p>
												<p className="ym-text-muted text-sm mt-2">
													Try adjusting your filters or search terms.
												</p>
											</div>
										) : (
											<>
												<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
													{events.map((event) => (
														<EventCard
															key={event._id}
															event={event}
															onSaveToggle={handleSaveToggle}
														/>
													))}
												</div>

												{/* Pagination */}
												{totalPages > 1 && (
													<div className="flex justify-center mt-8">
														<nav className="flex items-center bg-white rounded-lg shadow-md border ym-border-card overflow-hidden">
															<button
																onClick={() => handlePageChange(currentPage - 1)}
																disabled={currentPage === 1}
																className={`px-4 py-2 transition-colors ${
																	currentPage === 1
																		? 'ym-text-muted cursor-not-allowed'
																		: 'ym-text-yellow-600 hover:ym-bg-amber-100'
																}`}
															>
																Previous
															</button>

															{Array.from({ length: totalPages }, (_, i) => i + 1).map(
																(page) => (
																	<button
																		key={page}
																		onClick={() => handlePageChange(page)}
																		className={`px-4 py-2 transition-colors ${
																			currentPage === page
																				? 'gradient-bg text-white'
																				: 'ym-text-yellow-600 hover:ym-bg-amber-100'
																		}`}
																	>
																		{page}
																	</button>
																)
															)}

															<button
																onClick={() => handlePageChange(currentPage + 1)}
																disabled={currentPage === totalPages}
																className={`px-4 py-2 transition-colors ${
																	currentPage === totalPages
																		? 'ym-text-muted cursor-not-allowed'
																		: 'ym-text-yellow-600 hover:ym-bg-amber-100'
																}`}
															>
																Next
															</button>
														</nav>
													</div>
												)}
											</>
										)}
									</div>
								</>
							),
						},
						{
							key: 'recommended',
							label: 'Recommended for You',
							content: (
								<div>
									<h2 className="text-2xl font-bold ym-text-primary mb-6">Recommended Events</h2>

									{recommendedEvents.length === 0 ? (
										<div className="ym-bg-card p-8 rounded-xl shadow-lg text-center border ym-border-card">
											<div className="ym-bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
												<svg
													className="w-8 h-8 ym-text-yellow-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
													/>
												</svg>
											</div>
											<p className="ym-text-secondary text-lg">
												No recommended events available yet.
											</p>
											<p className="ym-text-muted text-sm mt-2">
												Attend more events to get personalized recommendations!
											</p>
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{recommendedEvents.map((event) => (
												<EventCard
													key={event._id}
													event={event}
													onSaveToggle={handleSaveToggle}
												/>
											))}
										</div>
									)}
								</div>
							),
						},
					]}
				/>
			</div>
		</div>
	);
};

export default UserDashboard;
