import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
	UserGroupIcon,
	UserIcon,
	CalendarIcon,
	TicketIcon,
	ChartBarIcon,
	ShieldCheckIcon,
	MegaphoneIcon,
	FlagIcon,
	StarIcon,
	SparklesIcon,
} from '@heroicons/react/24/outline';

// Constants
const INITIAL_STATS = {
	totalUsers: 0,
	totalOrganizers: 0,
	totalEvents: 0,
	totalRegistrations: 0,
	flaggedItems: 0,
};

const INITIAL_ANNOUNCEMENT = {
	title: '',
	message: '',
	type: 'info',
	target: 'all',
};

const ANNOUNCEMENT_TYPES = [
	{ value: 'info', label: 'Information' },
	{ value: 'success', label: 'Success' },
	{ value: 'warning', label: 'Warning' },
	{ value: 'error', label: 'Error' },
];

const TARGET_AUDIENCES = [
	{ value: 'all', label: 'All Users' },
	{ value: 'users', label: 'Regular Users' },
	{ value: 'organizers', label: 'Organizers' },
];

// Optimized Stats Card Component
const StatsCard = memo(({ title, value, description, icon, bgClass, borderClass, iconBgClass }) => (
	<div
		className={`${bgClass} p-6 rounded-xl border ${borderClass} hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}
	>
		<div
			className={`absolute top-0 right-0 w-20 h-20 ${iconBgClass} rounded-full -translate-y-10 translate-x-10`}
		></div>
		<div className="relative z-10">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
				<div
					className={`p-2 rounded-lg ${iconBgClass.replace('-5', '-10')} group-hover:${iconBgClass.replace(
						'-5',
						'-20'
					)} transition-colors`}
				>
					{icon}
				</div>
			</div>
			<p className="text-3xl font-bold text-primary">{value}</p>
			<p className="text-sm text-muted-foreground mt-1">{description}</p>
		</div>
	</div>
));

// Optimized User Card Component
const UserCard = memo(({ user, index, type = 'user' }) => {
	const isOrganizer = type === 'organizer';
	const colorClass = isOrganizer ? 'success' : 'info';

	return (
		<div className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 border-b border-border/20 last:border-0">
			<div className="flex items-center">
				<div className="relative">
					{user.profilePicture ? (
						<img
							src={user.profilePicture}
							alt={user.name}
							className={`w-12 h-12 rounded-xl mr-4 object-cover border-2 border-${colorClass}/20`}
						/>
					) : (
						<div
							className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${colorClass}/20 to-${colorClass}/10 flex items-center justify-center mr-4 border-2 border-${colorClass}/20`}
						>
							<span className={`text-${colorClass} font-bold text-lg`}>{user.name.charAt(0)}</span>
						</div>
					)}
					<div
						className={`absolute -top-1 -left-1 w-6 h-6 bg-${colorClass} rounded-full flex items-center justify-center text-white text-xs font-bold`}
					>
						{index + 1}
					</div>
				</div>
				<div>
					<h3
						className={`font-semibold text-card-foreground group-hover:text-${colorClass} transition-colors`}
					>
						{user.name}
					</h3>
					{isOrganizer ? (
						<p className="text-sm text-muted-foreground">
							{user.organizationName || 'Individual Organizer'}
						</p>
					) : (
						<div className="flex items-center text-sm">
							<span
								className={`inline-block px-2 py-1 bg-${colorClass}/10 text-${colorClass} rounded-lg text-xs font-medium mr-2`}
							>
								{user.badge}
							</span>
							<span className="text-muted-foreground">{user.xp} XP</span>
						</div>
					)}
				</div>
			</div>
			<div className="text-right">
				<p className="text-sm font-medium text-card-foreground">
					<span className={`text-${colorClass} font-bold`}>
						{isOrganizer ? user.eventsCount : user.eventsAttended}
					</span>{' '}
					events
				</p>
				{isOrganizer ? (
					<div className="flex items-center justify-end mt-1">
						{[...Array(5)].map((_, starIndex) => (
							<StarIcon
								key={starIndex}
								className={`h-4 w-4 transition-colors ${
									starIndex < Math.floor(user.rating || 0)
										? 'text-brand-primary fill-current'
										: 'text-muted-foreground/30'
								}`}
							/>
						))}
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						{user.lastActive ? `Last: ${new Date(user.lastActive).toLocaleDateString()}` : ''}
					</p>
				)}
			</div>
		</div>
	);
});

const Dashboard = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState(INITIAL_STATS);
	const [topOrganizers, setTopOrganizers] = useState([]);
	const [activeUsers, setActiveUsers] = useState([]);
	const [flaggedContent, setFlaggedContent] = useState([]);
	const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
	const [announcement, setAnnouncement] = useState(INITIAL_ANNOUNCEMENT);

	// Memoized admin sections configuration
	const adminSections = useMemo(
		() => [
			{
				title: 'Users',
				description: 'Manage all users, change roles, and moderate accounts',
				icon: <UserIcon className="h-8 w-8 text-indigo" />,
				link: '/admin/users',
				count: stats.totalUsers - stats.totalOrganizers,
				bg: 'bg-indigo-10',
				text: 'text-indigo',
			},
			{
				title: 'Organizers',
				description: 'View and manage event organizers and their activities',
				icon: <UserGroupIcon className="h-8 w-8 text-success" />,
				link: '/admin/organizers',
				count: stats.totalOrganizers,
				bg: 'bg-success-10',
				text: 'text-success',
			},
			{
				title: 'Events',
				description: 'Monitor all events, review content, and manage listings',
				icon: <CalendarIcon className="h-8 w-8 text-purple" />,
				link: '/admin/events',
				count: stats.totalEvents,
				bg: 'bg-purple-10',
				text: 'text-purple',
			},
			{
				title: 'Registrations',
				description: 'Track event registrations and attendee metrics',
				icon: <TicketIcon className="h-8 w-8 text-cyan" />,
				link: '/admin/analytics',
				count: stats.totalRegistrations,
				bg: 'bg-cyan-10',
				text: 'text-cyan',
			},
			{
				title: 'Analytics',
				description: 'View platform statistics and performance metrics',
				icon: <ChartBarIcon className="h-8 w-8 text-teal" />,
				link: '/admin/analytics',
				bg: 'bg-teal-10',
				text: 'text-teal',
			},
			{
				title: 'Moderation',
				description: 'Review flagged content and user reports',
				icon: <ShieldCheckIcon className="h-8 w-8 text-destructive" />,
				link: '/admin/moderation',
				count: stats.flaggedItems,
				bg: 'bg-destructive-10',
				text: 'text-destructive',
			},
			{
				title: 'Announcements',
				description: 'Create and manage system-wide announcements',
				icon: <MegaphoneIcon className="h-8 w-8 text-pink" />,
				link: '/admin/announcements',
				bg: 'bg-pink-10',
				text: 'text-pink',
			},
		],
		[stats]
	);

	// Memoized stats cards data
	const statsCardsData = useMemo(
		() => [
			{
				title: 'Total Users',
				value: stats.totalUsers,
				description: 'Registered members',
				icon: <UserIcon className="h-6 w-6 text-primary" />,
				bgClass: 'bg-gradient-primary-light',
				borderClass: 'border-primary-20',
				iconBgClass: 'bg-primary-5',
			},
			{
				title: 'Organizers',
				value: stats.totalOrganizers,
				description: 'Active organizers',
				icon: <UserGroupIcon className="h-6 w-6 text-success" />,
				bgClass: 'bg-gradient-success-light',
				borderClass: 'border-success-20',
				iconBgClass: 'bg-success-5',
			},
			{
				title: 'Total Events',
				value: stats.totalEvents,
				description: 'Events created',
				icon: <CalendarIcon className="h-6 w-6 text-brand-tertiary" />,
				bgClass: 'bg-gradient-brand-tertiary-light',
				borderClass: 'border-brand-tertiary-20',
				iconBgClass: 'bg-brand-tertiary-5',
			},
			{
				title: 'Registrations',
				value: stats.totalRegistrations,
				description: 'Total bookings',
				icon: <TicketIcon className="h-6 w-6 text-brand-primary" />,
				bgClass: 'bg-gradient-brand-primary-light',
				borderClass: 'border-brand-primary-20',
				iconBgClass: 'bg-brand-primary-5',
			},
		],
		[stats]
	);

	// Optimized data fetching
	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const [statsRes, organizersRes, usersRes, flaggedRes] = await Promise.all([
				axios.get('/admin/dashboard/stats'),
				axios.get('/admin/top-organizers?limit=5'),
				axios.get('/admin/active-users?limit=5'),
				axios.get('/admin/flagged-content?limit=5'),
			]);

			if (statsRes.data.success) {
				setStats(statsRes.data.stats);
			}

			setTopOrganizers(
				organizersRes.data.success && Array.isArray(organizersRes.data.organizers)
					? organizersRes.data.organizers
					: []
			);

			setActiveUsers(usersRes.data.success && Array.isArray(usersRes.data.users) ? usersRes.data.users : []);

			setFlaggedContent(
				flaggedRes.data.success && Array.isArray(flaggedRes.data.items) ? flaggedRes.data.items : []
			);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			setError('Failed to load dashboard data. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const handleAnnouncementChange = useCallback((e) => {
		const { name, value } = e.target;
		setAnnouncement((prev) => ({ ...prev, [name]: value }));
	}, []);

	const submitAnnouncement = useCallback(
		async (e) => {
			e.preventDefault();
			try {
				const response = await axios.post('/admin/announcements', announcement);
				if (response.data.success) {
					setAnnouncement(INITIAL_ANNOUNCEMENT);
					setShowAnnouncementForm(false);
					alert('Announcement sent successfully!');
				}
			} catch (error) {
				console.error('Error sending announcement:', error);
				alert('Failed to send announcement. Please try again.');
			}
		},
		[announcement]
	);

	const toggleAnnouncementForm = useCallback(() => {
		setShowAnnouncementForm((prev) => !prev);
		if (showAnnouncementForm) {
			setAnnouncement(INITIAL_ANNOUNCEMENT);
		}
	}, [showAnnouncementForm]);

	// Memoized components
	const LoadingComponent = useMemo(
		() => (
			<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
				<div className="container mx-auto px-4 py-8">
					<div className="flex justify-center items-center h-64">
						<div className="relative">
							<div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
							<div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-brand-secondary rounded-full animate-ping"></div>
						</div>
						<div className="ml-6">
							<h2 className="text-2xl font-bold text-primary animate-pulse">Loading Dashboard</h2>
							<p className="text-muted-foreground mt-2">Please wait while we fetch the latest data...</p>
						</div>
					</div>
				</div>
			</div>
		),
		[]
	);

	if (loading) return LoadingComponent;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="container mx-auto px-4 py-8">
				{error && (
					<div className="max-w-4xl mx-auto mb-8 animate-fade-in">
						<div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm">
							<div className="flex items-center">
								<div className="w-2 h-8 bg-destructive rounded-full mr-4"></div>
								<div>
									<strong className="font-bold">Error!</strong>
									<span className="block sm:inline ml-2">{error}</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm animate-fade-in mt-10">
					{/* Header with gradient */}
					<div className="bg-gradient-to-r from-primary/10 via-brand-light to-accent/20 p-8 border-b border-border/30">
						<div className="flex items-center space-x-3">
							<SparklesIcon className="h-8 w-8 text-primary" />
							<h1 className="text-3xl font-bold text-card-foreground">Admin Control Panel</h1>
						</div>
						<p className="text-muted-foreground mt-2">
							Manage your platform with comprehensive admin tools
						</p>
					</div>

					<div className="p-8">
						{/* Enhanced Stats Overview */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
							{statsCardsData.map((card, index) => (
								<StatsCard
									key={index}
									title={card.title}
									value={card.value}
									description={card.description}
									icon={card.icon}
									bgClass={card.bgClass}
									borderClass={card.borderClass}
									iconBgClass={card.iconBgClass}
								/>
							))}
						</div>

						{/* Enhanced Admin Sections */}
						<h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
							<ChartBarIcon className="h-6 w-6 text-primary mr-3" />
							Admin Sections
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{adminSections.map((section, index) => (
								<Link
									key={index}
									to={section.link}
									className={`group ${section.bg} hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 rounded-xl border border-border/30 hover:border-primary/30 flex flex-col backdrop-blur-sm min-h-[180px]`}
								>
									<div className="flex items-center mb-4">
										<div className="p-3 rounded-xl bg-card/80 shadow-sm border border-border/20">
											{section.icon}
										</div>
										<h3 className="text-lg font-semibold ml-3 text-card-foreground group-hover:text-primary transition-colors">
											{section.title}
										</h3>
									</div>
									<p className="text-muted-foreground mb-4 flex-grow leading-relaxed text-sm">
										{section.description}
									</p>
									{section.count !== undefined ? (
										<div className="flex items-center justify-between mt-auto pt-3 border-t border-border/20">
											<p className={`text-2xl font-bold ${section.text}`}>{section.count}</p>
											<div className="text-xs text-muted-foreground font-medium">
												View Details →
											</div>
										</div>
									) : (
										<div className="flex items-center justify-between mt-auto pt-3 border-t border-border/20">
											<div
												className={`px-3 py-1 rounded-lg ${
													section.bg
												} border ${section.text.replace(
													'text-',
													'border-'
												)} text-xs font-semibold`}
											>
												Available
											</div>
											<div className="text-xs text-muted-foreground font-medium">
												Access Now →
											</div>
										</div>
									)}
								</Link>
							))}
						</div>

						{/* Enhanced Send Announcement Section */}
						{showAnnouncementForm ? (
							<div className="bg-card rounded-xl shadow-lg border border-border/50 p-6 mb-8 backdrop-blur-sm">
								<div className="flex justify-between items-center mb-6">
									<div className="flex items-center space-x-2">
										<MegaphoneIcon className="h-6 w-6 text-warning" />
										<h2 className="text-xl font-bold text-card-foreground">Send Announcement</h2>
									</div>
									<button
										onClick={toggleAnnouncementForm}
										className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted/50"
									>
										Cancel
									</button>
								</div>

								<form onSubmit={submitAnnouncement} className="space-y-6">
									<div>
										<label
											htmlFor="title"
											className="block text-sm font-semibold text-card-foreground mb-2"
										>
											Announcement Title
										</label>
										<input
											type="text"
											id="title"
											name="title"
											value={announcement.title}
											onChange={handleAnnouncementChange}
											required
											className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
											placeholder="Enter announcement title..."
										/>
									</div>

									<div>
										<label
											htmlFor="message"
											className="block text-sm font-semibold text-card-foreground mb-2"
										>
											Message
										</label>
										<textarea
											id="message"
											name="message"
											rows={4}
											value={announcement.message}
											onChange={handleAnnouncementChange}
											required
											className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all resize-none"
											placeholder="Enter your announcement message..."
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="type"
												className="block text-sm font-semibold text-card-foreground mb-2"
											>
												Announcement Type
											</label>
											<select
												id="type"
												name="type"
												value={announcement.type}
												onChange={handleAnnouncementChange}
												className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
											>
												{ANNOUNCEMENT_TYPES.map((type) => (
													<option key={type.value} value={type.value}>
														{type.label}
													</option>
												))}
											</select>
										</div>

										<div>
											<label
												htmlFor="target"
												className="block text-sm font-semibold text-card-foreground mb-2"
											>
												Target Audience
											</label>
											<select
												id="target"
												name="target"
												value={announcement.target}
												onChange={handleAnnouncementChange}
												className="input-base w-full px-4 py-3 rounded-xl focus-ring transition-all"
											>
												{TARGET_AUDIENCES.map((audience) => (
													<option key={audience.value} value={audience.value}>
														{audience.label}
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="flex justify-end pt-4 border-t border-border/30">
										<button
											type="submit"
											className="btn-primary px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
										>
											<MegaphoneIcon className="h-5 w-5 mr-2" />
											Send Announcement
										</button>
									</div>
								</form>
							</div>
						) : (
							<div className="flex justify-center mb-8">
								<button
									onClick={toggleAnnouncementForm}
									className="btn-primary px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
								>
									<MegaphoneIcon className="h-5 w-5 mr-2" />
									Send Announcement
								</button>
							</div>
						)}

						{/* Enhanced Top Organizers and Active Users */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
							{/* Enhanced Top Organizers */}
							<div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm">
								<div className="bg-gradient-to-r from-success/10 to-brand-light/10 p-6 border-b border-border/30">
									<h2 className="text-xl font-bold text-card-foreground flex items-center">
										<UserGroupIcon className="h-6 w-6 text-success mr-3" />
										Top Organizers
									</h2>
									<p className="text-muted-foreground mt-1">Most successful event organizers</p>
								</div>

								<div className="p-6">
									{topOrganizers.length === 0 ? (
										<div className="text-center py-8">
											<UserGroupIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
											<p className="text-muted-foreground">No data available</p>
										</div>
									) : (
										<div className="space-y-4">
											{topOrganizers.map((organizer, index) => (
												<UserCard
													key={organizer._id}
													user={organizer}
													index={index}
													type="organizer"
												/>
											))}
										</div>
									)}

									<div className="mt-6 pt-4 border-t border-border/30 text-right">
										<Link
											to="/admin/organizers"
											className="text-success hover:text-success/80 font-medium text-sm transition-colors inline-flex items-center"
										>
											View All Organizers
											<span className="ml-1">→</span>
										</Link>
									</div>
								</div>
							</div>

							{/* Enhanced Most Active Users */}
							<div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm">
								<div className="bg-gradient-to-r from-info/10 to-brand-light/10 p-6 border-b border-border/30">
									<h2 className="text-xl font-bold text-card-foreground flex items-center">
										<UserIcon className="h-6 w-6 text-info mr-3" />
										Most Active Users
									</h2>
									<p className="text-muted-foreground mt-1">Users with highest engagement</p>
								</div>

								<div className="p-6">
									{activeUsers.length === 0 ? (
										<div className="text-center py-8">
											<UserIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
											<p className="text-muted-foreground">No data available</p>
										</div>
									) : (
										<div className="space-y-4">
											{activeUsers.map((user, index) => (
												<UserCard key={user._id} user={user} index={index} type="user" />
											))}
										</div>
									)}

									<div className="mt-6 pt-4 border-t border-border/30 text-right">
										<Link
											to="/admin/users"
											className="text-info hover:text-info/80 font-medium text-sm transition-colors inline-flex items-center"
										>
											View All Users
											<span className="ml-1">→</span>
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Enhanced Flagged Content Section */}
						{flaggedContent.length > 0 && (
							<div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm mb-8">
								<div className="bg-gradient-to-r from-destructive/10 to-warning/10 p-6 border-b border-border/30">
									<div className="flex items-center">
										<FlagIcon className="h-6 w-6 text-destructive mr-3" />
										<div>
											<h2 className="text-xl font-bold text-card-foreground">
												Recently Flagged Items
											</h2>
											<p className="text-muted-foreground mt-1">
												Content requiring moderation attention
											</p>
										</div>
									</div>
								</div>

								<div className="p-6">
									<div className="space-y-4">
										{flaggedContent.map((item) => (
											<div
												key={item._id}
												className="bg-destructive/5 hover:bg-destructive/10 p-4 rounded-xl border border-destructive/20 transition-all duration-200"
											>
												<div className="flex justify-between items-start">
													<div className="flex-grow">
														<div className="flex items-center mb-2">
															<span className="inline-block px-3 py-1 bg-destructive/10 text-destructive rounded-lg text-xs font-semibold mr-3">
																{item.type}
															</span>
															<h3 className="font-semibold text-card-foreground">
																{item.title}
															</h3>
														</div>
														<p className="text-sm text-muted-foreground leading-relaxed">
															{item.reason}
														</p>
													</div>
													<div className="text-right ml-4">
														<span className="text-xs text-muted-foreground block mb-3">
															{new Date(item.reportedAt).toLocaleDateString()}
														</span>
														<Link
															to={`/admin/moderation/${item.type}/${item._id}`}
															className="inline-flex items-center px-4 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-brand-dark transition-all duration-200 transform hover:scale-105"
														>
															Review
														</Link>
													</div>
												</div>
											</div>
										))}
									</div>

									<div className="mt-6 pt-4 border-t border-border/30 text-right">
										<Link
											to="/admin/moderation"
											className="text-destructive hover:text-destructive/80 font-medium text-sm transition-colors inline-flex items-center"
										>
											View All Flagged Content
											<span className="ml-1">→</span>
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
