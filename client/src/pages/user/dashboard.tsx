import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios, { AxiosResponse } from 'axios';
import EventCard from '../../components/organizer/EventCard';
import XPProgressBar from '../../components/user/XPProgressBar';
import { Tabs, SearchAndFilter } from '../../components/common';
import { UserDashboardProfile, Announcement, EventCardData, AnnouncementsApiResponse, AnnouncementType } from '@/types';
import { EVENT_TYPES, EVENT_CATEGORIES } from '../../utils/eventConstants';

const UserDashboard: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [userProfile, setUserProfile] = useState<UserDashboardProfile | null>(null);
	const [registeredEvents, setRegisteredEvents] = useState<EventCardData[]>([]);
	const [savedEvents, setSavedEvents] = useState<EventCardData[]>([]);
	const [filteredRegisteredEvents, setFilteredRegisteredEvents] = useState<EventCardData[]>([]);
	const [filteredSavedEvents, setFilteredSavedEvents] = useState<EventCardData[]>([]);
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [activeTab, setActiveTab] = useState<string>('registered');

	// Handle filtered data changes from SearchAndFilter component
	const handleRegisteredEventsFilterChange = (filtered: any[]) => {
		setFilteredRegisteredEvents(filtered as EventCardData[]);
	};

	const handleSavedEventsFilterChange = (filtered: any[]) => {
		setFilteredSavedEvents(filtered as EventCardData[]);
	};

	// Load user profile and events
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Get user profile with XP and badge
				const profileResponse: AxiosResponse<{ profile: UserDashboardProfile }> = await axios.get(
					'/user/dashboard'
				);
				setUserProfile(profileResponse.data.profile);

				// Get user's registered and saved events
				const userEventsResponse: AxiosResponse<{
					success: boolean;
					xp: number;
					badge: string;
					savedEvents: EventCardData[];
					events: EventCardData[];
				}> = await axios.get('/user/events');

				if (userEventsResponse.data.success) {
					const events = userEventsResponse.data.events || [];
					const saved = userEventsResponse.data.savedEvents || [];
					setRegisteredEvents(events);
					setSavedEvents(saved);
					setFilteredRegisteredEvents(events);
					setFilteredSavedEvents(saved);
				}

				// Fetch active announcements
				const announcementsResponse: AxiosResponse<AnnouncementsApiResponse> = await axios.get(
					'/user/announcements'
				);
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

	// Handle saving/unsaving event
	const handleSaveToggle = (eventId: string, isSaved: boolean): void => {
		// Update the saved events UI to reflect saved state
		setSavedEvents(savedEvents.map((event) => (event._id === eventId ? { ...event, isSaved } : event)));

		// Update registered events UI to reflect saved state
		setRegisteredEvents(registeredEvents.map((event) => (event._id === eventId ? { ...event, isSaved } : event)));
	};

	// Dummy handlers for EventCard (since these are not needed for dashboard)
	const handleManage = () => {};
	const handleEdit = () => {};
	const handleDelete = () => {};

	// Announcement type styling
	const getAnnouncementStyle = (type: AnnouncementType): string => {
		switch (type) {
			case 'info':
				return 'ym-bg-amber-100 border-l-amber-400 ym-text-yellow-700';
			case 'warning':
				return 'ym-bg-amber-100 border-l-amber-600 ym-text-yellow-700';
			case 'success':
				return 'ym-bg-success bg-opacity-10 border-l-green-400 ym-text-success';
			case 'error':
				return 'ym-bg-destructive bg-opacity-10 border-l-red-400 ym-text-destructive';
			default:
				return 'ym-bg-amber-100 border-l-amber-400 ym-text-yellow-700';
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-destructive mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
					>
						Retry
					</button>
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

						<XPProgressBar xp={userProfile.xp || 0} />

						{(userProfile.streakCount || 0) > 0 && (
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
					activeTab={activeTab}
					onTabChange={setActiveTab}
					tabs={[
						{
							id: 'registered',
							key: 'registered',
							label: 'Registered Events',
							content: (
								<>
									{/* Search and Filters Section */}
									<SearchAndFilter
										data={registeredEvents}
										onFilteredDataChange={handleRegisteredEventsFilterChange}
										itemType="events"
										disableAnimations={true}
										searchPlaceholder="Search events by title, location, or tags..."
										statusOptions={[
											{ value: '', label: 'All Status' },
											{ value: 'popular', label: 'Most Popular' },
											{ value: 'upcoming', label: 'Upcoming' },
											{ value: 'ongoing', label: 'Ongoing' },
											{ value: 'completed', label: 'Completed' },
										]}
										categoryOptions={EVENT_CATEGORIES}
										eventTypeOptions={EVENT_TYPES}
										showCategory={true}
										showAdvancedFilters={true}
										enableDateRange={true}
										enableEventType={true}
										enableOnlineOnly={true}
										enableFreeOnly={true}
									/>

									<div className="mb-8">
										<h2 className="text-2xl font-bold ym-text-primary mb-6">
											Your Registered Events
										</h2>

										{filteredRegisteredEvents.length === 0 ? (
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
															d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
												</div>
												<p className="ym-text-secondary text-lg">
													{registeredEvents.length === 0
														? "You haven't registered for any events yet."
														: 'No events match your search criteria.'}
												</p>
												<p className="ym-text-muted text-sm mt-2">
													{registeredEvents.length === 0
														? 'Explore events and register to start earning XP!'
														: 'Try adjusting your search or filters.'}
												</p>
											</div>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{filteredRegisteredEvents.map((event) => (
													<EventCard
														key={event._id}
														event={event}
														onSaveToggle={handleSaveToggle}
														onManage={handleManage}
														onEdit={handleEdit}
														onDelete={handleDelete}
													/>
												))}
											</div>
										)}
									</div>
								</>
							),
						},
						{
							id: 'saved',
							key: 'saved',
							label: 'Saved Events',
							content: (
								<>
									{/* Search and Filters Section for Saved Events */}
									<SearchAndFilter
										data={savedEvents}
										onFilteredDataChange={handleSavedEventsFilterChange}
										itemType="events"
										disableAnimations={true}
										searchPlaceholder="Search saved events by title, location, or tags..."
										statusOptions={[
											{ value: '', label: 'All Status' },
											{ value: 'popular', label: 'Most Popular' },
											{ value: 'upcoming', label: 'Upcoming' },
											{ value: 'ongoing', label: 'Ongoing' },
											{ value: 'completed', label: 'Completed' },
										]}
										categoryOptions={EVENT_CATEGORIES}
										eventTypeOptions={EVENT_TYPES}
										showCategory={true}
										showAdvancedFilters={true}
										enableDateRange={true}
										enableEventType={true}
										enableOnlineOnly={true}
										enableFreeOnly={true}
									/>

									<div className="mb-8">
										<h2 className="text-2xl font-bold ym-text-primary mb-6">Your Saved Events</h2>

										{filteredSavedEvents.length === 0 ? (
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
															d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
														/>
													</svg>
												</div>
												<p className="ym-text-secondary text-lg">
													{savedEvents.length === 0
														? "You haven't saved any events yet."
														: 'No saved events match your search criteria.'}
												</p>
												<p className="ym-text-muted text-sm mt-2">
													{savedEvents.length === 0
														? "Save events you're interested in to view them later!"
														: 'Try adjusting your search or filters.'}
												</p>
											</div>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{filteredSavedEvents.map((event) => (
													<EventCard
														key={event._id}
														event={event}
														onSaveToggle={handleSaveToggle}
														onManage={handleManage}
														onEdit={handleEdit}
														onDelete={handleDelete}
													/>
												))}
											</div>
										)}
									</div>
								</>
							),
						},
					]}
				/>
			</div>
		</div>
	);
};

export default UserDashboard;
