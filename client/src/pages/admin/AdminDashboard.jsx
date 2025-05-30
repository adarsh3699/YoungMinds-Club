import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import axios from 'axios';
import {
	UserGroupIcon,
	UserIcon,
	CalendarIcon,
	TicketIcon,
	ChartBarIcon,
	ShieldCheckIcon,
	MegaphoneIcon,
} from '@heroicons/react/24/outline';

// Import dashboard components
import {
	StatsCard,
	AdminSectionCard,
	AnnouncementForm,
	TopOrganizers,
	DashboardHeader,
	ActiveUsers,
	LoadingComponent,
} from '../../components/admin/dashboard';

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

const AdminDashboard = () => {
	const { user } = useAuth();
	const { showError } = useError();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState(INITIAL_STATS);
	const [topOrganizers, setTopOrganizers] = useState([]);
	const [activeUsers, setActiveUsers] = useState([]);
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

			const [statsRes, organizersRes, usersRes] = await Promise.all([
				axios.get('/admin/dashboard/stats'),
				axios.get('/admin/top-organizers?limit=5'),
				axios.get('/admin/active-users?limit=5'),
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
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			showError('Failed to load dashboard data. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, [showError]);

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

	if (loading) return <LoadingComponent />;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="container mx-auto px-4 py-8">
				<div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm animate-fade-in mt-10">
					<DashboardHeader />

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
								<AdminSectionCard key={index} section={section} />
							))}
						</div>

						{/* Enhanced Send Announcement Section */}
						<AnnouncementForm showForm={showAnnouncementForm} onToggleForm={toggleAnnouncementForm} />

						{/* Enhanced Top Organizers and Active Users */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
							<TopOrganizers topOrganizers={topOrganizers} />
							<ActiveUsers activeUsers={activeUsers} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
