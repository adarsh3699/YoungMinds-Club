import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { ExclamationTriangleIcon, UserIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import Tabs from '@/components/common/Tabs';
import { AdminConfirmationModal, AdminPageHeader } from '@/components/admin/dashboard';
import { FlaggedItems, ModerationApiResponse, FlaggedUser, FlaggedEvent } from '@/types';

// Unified modal state management
type ModalState = {
	isOpen: boolean;
	type: 'unflag-user' | 'unflag-event' | 'delete-event' | 'status-user' | null;
	targetId: string | null;
	targetName: string;
	currentStatus?: string;
	context: 'user' | 'event';
};

// Empty State Component
const EmptyState: React.FC<{
	title: string;
	description: string;
	showBackButton?: boolean;
}> = React.memo(({ title, description, showBackButton = false }) => (
	<div className="text-center py-12">
		<ShieldCheckIcon className="w-16 h-16 ym-text-muted mx-auto mb-4" />
		<h3 className="text-lg font-medium ym-text-primary mb-2">{title}</h3>
		<p className="ym-text-muted">{description}</p>
		{showBackButton && (
			<div className="mt-6">
				<Link to="/admin/dashboard">
					<Button className="gradient-bg ym-text-white">Return to Dashboard</Button>
				</Link>
			</div>
		)}
	</div>
));

// Flag Reason Badge Component
const FlagReasonBadge: React.FC<{ reason?: string | null }> = React.memo(({ reason }) => (
	<div className="mb-4">
		<p className="text-sm ym-text-muted mb-1">Flag Reason:</p>
		<span className="text-sm font-medium text-warning bg-warning-10 px-2 py-1 rounded">
			{reason || 'No reason provided'}
		</span>
	</div>
));

// User Card Component
const UserCard: React.FC<{
	user: FlaggedUser;
	onAction: (type: ModalState['type'], id: string, name: string, status?: string) => void;
}> = React.memo(({ user, onAction }) => (
	<div className="ym-bg-card ym-border-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-gradient-primary-light">
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-4">
				<div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
					<UserIcon className="w-6 h-6 ym-text-white" />
				</div>
				<div>
					<h3 className="text-lg font-semibold ym-text-primary">{user.name}</h3>
					<p className="ym-text-muted">{user.email}</p>
					<div className="flex items-center space-x-2 mt-1">
						<span className="text-xs px-2 py-1 rounded-full bg-primary-5 ym-text-primary font-medium">
							{user.role}
						</span>
						<span
							className={`text-xs px-2 py-1 rounded-full ${
								user.status === 'active' ? 'bg-success-10 text-success' : 'bg-destructive-10 text-error'
							}`}
						>
							{user.status || 'active'}
						</span>
					</div>
				</div>
			</div>
			<div className="text-right">
				<FlagReasonBadge reason={user.flagReason} />
				<div className="flex space-x-2">
					<Button
						onClick={() => onAction('unflag-user', user._id, user.name)}
						className="btn-secondary text-sm"
					>
						Unflag
					</Button>
					<Button
						onClick={() => onAction('status-user', user._id, user.name, user.status || 'active')}
						className={user.status !== 'suspended' ? 'bg-warning text-sm' : 'bg-success text-sm'}
					>
						{user.status !== 'suspended' ? 'Suspend' : 'Activate'}
					</Button>
					<Link to="/admin/users">
						<Button className="ym-btn-secondary text-sm">View Details</Button>
					</Link>
				</div>
			</div>
		</div>
	</div>
));

// Event Card Component
const EventCard: React.FC<{
	event: FlaggedEvent;
	onAction: (type: ModalState['type'], id: string, name: string) => void;
}> = React.memo(({ event, onAction }) => (
	<div className="ym-bg-card ym-border-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-gradient-brand-tertiary-light">
		<div className="flex items-start space-x-4">
			<img
				src={event.poster}
				alt={event.title}
				className="w-16 h-16 object-cover rounded-lg border-2 border-brand-primary shadow-sm"
				onError={(e) => {
					(e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Event';
				}}
			/>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold ym-text-primary mb-1">{event.title}</h3>
						<div className="flex items-center space-x-4 ym-text-muted text-sm mb-2">
							<span className="flex items-center space-x-1">
								<UserIcon className="w-4 h-4" />
								<span>{event.organizer?.name || 'Unknown'}</span>
							</span>
							<span className="flex items-center space-x-1">
								<CalendarIcon className="w-4 h-4" />
								<span>{format(new Date(event.date), 'PPP')}</span>
							</span>
						</div>
						<div className="mb-3">
							<span className="text-sm ym-text-muted">Flag Reason: </span>
							<span className="text-sm font-medium text-warning bg-warning-10 px-2 py-1 rounded">
								{event.flagReason || 'No reason provided'}
							</span>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							onClick={() => onAction('unflag-event', event._id, event.title)}
							className="btn-secondary text-sm"
						>
							Unflag
						</Button>
						<Button
							onClick={() => onAction('delete-event', event._id, event.title)}
							className="bg-destructive text-sm"
						>
							Delete
						</Button>
						<Link to={`/event/${event._id}`}>
							<Button className="ym-btn-secondary text-sm">View Event</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	</div>
));

// Stats Cards Component
const StatsCards: React.FC<{ userCount: number; eventCount: number }> = React.memo(({ userCount, eventCount }) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
		<div className="bg-gradient-primary-light p-4 rounded-lg border border-primary-20">
			<div className="flex items-center space-x-3">
				<UserIcon className="w-8 h-8 text-primary" />
				<div>
					<p className="text-2xl font-bold ym-text-primary">{userCount}</p>
					<p className="ym-text-muted">Flagged Users</p>
				</div>
			</div>
		</div>
		<div className="bg-gradient-brand-tertiary-light p-4 rounded-lg border border-brand-tertiary border-opacity-20">
			<div className="flex items-center space-x-3">
				<CalendarIcon className="w-8 h-8 text-brand-tertiary" />
				<div>
					<p className="text-2xl font-bold ym-text-primary">{eventCount}</p>
					<p className="ym-text-muted">Flagged Events</p>
				</div>
			</div>
		</div>
	</div>
));

const ModerationPage: React.FC = () => {
	const [flaggedItems, setFlaggedItems] = useState<FlaggedItems>({ users: [], events: [] });
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>('users');

	// Unified modal state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		type: null,
		targetId: null,
		targetName: '',
		context: 'user',
	});

	// Memoized API call
	const fetchFlaggedItems = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			const response: AxiosResponse<ModerationApiResponse> = await axios.get('/admin/moderation/flagged');
			if (response.data.success) {
				setFlaggedItems(response.data.flaggedItems);
			}
		} catch (error) {
			console.error('Error fetching flagged items:', error);
			setError('Failed to load flagged items. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFlaggedItems();
	}, [fetchFlaggedItems]);

	// Unified modal handlers
	const openModal = useCallback((type: ModalState['type'], id: string, name: string, status?: string) => {
		const context = type?.includes('user') ? 'user' : 'event';
		setModal({
			isOpen: true,
			type,
			targetId: id,
			targetName: name,
			currentStatus: status,
			context,
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({ ...prev, isOpen: false, type: null }));
	}, []);

	// Unified API handlers
	const handleModalConfirm = useCallback(async () => {
		if (!modal.targetId || !modal.type) return;

		try {
			switch (modal.type) {
				case 'unflag-user':
					await axios.put(`/admin/users/${modal.targetId}/flag`, { isFlagged: false });
					setFlaggedItems((prev) => ({
						...prev,
						users: prev.users.filter((user) => user._id !== modal.targetId),
					}));
					break;

				case 'unflag-event':
					await axios.put(`/admin/events/${modal.targetId}/flag`, { isFlagged: false });
					setFlaggedItems((prev) => ({
						...prev,
						events: prev.events.filter((event) => event._id !== modal.targetId),
					}));
					break;

				case 'delete-event':
					await axios.delete(`/admin/events/${modal.targetId}`);
					setFlaggedItems((prev) => ({
						...prev,
						events: prev.events.filter((event) => event._id !== modal.targetId),
					}));
					break;

				case 'status-user':
					const newStatus = modal.currentStatus === 'suspended' ? 'active' : 'suspended';
					await axios.put(`/admin/users/${modal.targetId}/status`, { status: newStatus });
					setFlaggedItems((prev) => ({
						...prev,
						users: prev.users.map((user) =>
							user._id === modal.targetId ? { ...user, status: newStatus } : user
						),
					}));
					break;
			}
			closeModal();
		} catch (error) {
			console.error('Error performing action:', error);
			setError('Failed to complete action. Please try again.');
		}
	}, [modal, closeModal]);

	// Memoized content components
	const UserContent = useMemo(
		() => (
			<div className="space-y-4">
				{flaggedItems.users.length > 0 ? (
					<div className="space-y-4">
						{flaggedItems.users.map((user) => (
							<UserCard key={user._id} user={user} onAction={openModal} />
						))}
					</div>
				) : (
					<EmptyState title="No Flagged Users" description="All users are in good standing." />
				)}
			</div>
		),
		[flaggedItems.users, openModal]
	);

	const EventContent = useMemo(
		() => (
			<div className="space-y-4">
				{flaggedItems.events.length > 0 ? (
					<div className="space-y-4">
						{flaggedItems.events.map((event) => (
							<EventCard key={event._id} event={event} onAction={openModal} />
						))}
					</div>
				) : (
					<EmptyState title="No Flagged Events" description="All events meet community standards." />
				)}
			</div>
		),
		[flaggedItems.events, openModal]
	);

	// Memoized tabs configuration
	const tabs = useMemo(
		() => [
			{
				id: 'users',
				label: `Flagged Users (${flaggedItems.users.length})`,
				icon: <UserIcon className="w-4 h-4" />,
				content: UserContent,
			},
			{
				id: 'events',
				label: `Flagged Events (${flaggedItems.events.length})`,
				icon: <CalendarIcon className="w-4 h-4" />,
				content: EventContent,
			},
		],
		[flaggedItems.users.length, flaggedItems.events.length, UserContent, EventContent]
	);

	// Memoized modal props
	const modalProps = useMemo(() => {
		const getModalType = (): 'flag' | 'delete' | 'status' | 'demote' => {
			switch (modal.type) {
				case 'unflag-user':
				case 'unflag-event':
					return 'flag';
				case 'delete-event':
					return 'delete';
				case 'status-user':
					return 'status';
				default:
					return 'delete';
			}
		};

		return {
			modalType: getModalType(),
			isOpen: modal.isOpen,
			onClose: closeModal,
			userName: modal.targetName,
			isFlagged: modal.type?.includes('unflag'),
			flagReason: '',
			currentStatus: modal.currentStatus,
			onConfirm: handleModalConfirm,
			context: modal.context,
		};
	}, [modal, closeModal, handleModalConfirm]);

	const totalFlagged = flaggedItems.users.length + flaggedItems.events.length;

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Header Section */}
				<AdminPageHeader
					icon={<ExclamationTriangleIcon className="w-6 h-6" />}
					title="Content Moderation Center"
					description="Review and manage flagged content across the platform"
				/>

				{/* Alert Section */}
				{error && (
					<div className="bg-destructive-10 border border-destructive-20 text-error px-6 py-4 rounded-lg mb-6 flex items-center space-x-3">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Main Content */}
				<div className="ym-bg-card ym-border-card border rounded-xl shadow-lg overflow-hidden">
					{loading ? (
						<div className="text-center py-20">
							<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="ym-text-muted text-lg">Loading flagged content...</p>
						</div>
					) : totalFlagged === 0 ? (
						<div className="p-6">
							<div className="text-center py-20">
								<ShieldCheckIcon className="w-20 h-20 text-success mx-auto mb-4" />
								<h2 className="text-2xl font-bold ym-text-primary mb-2">All Clear!</h2>
								<p className="ym-text-muted text-lg">No flagged content requires your attention.</p>
								<div className="mt-6">
									<Link to="/admin/dashboard">
										<Button className="gradient-bg ym-text-white">Return to Dashboard</Button>
									</Link>
								</div>
							</div>
						</div>
					) : (
						<div className="p-6">
							<StatsCards userCount={flaggedItems.users.length} eventCount={flaggedItems.events.length} />
							<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
						</div>
					)}
				</div>

				{/* Unified Confirmation Modal */}
				<AdminConfirmationModal {...modalProps} />
			</div>
		</div>
	);
};

export default ModerationPage;
