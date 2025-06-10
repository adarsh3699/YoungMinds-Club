import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { ExclamationTriangleIcon, UserIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import Tabs from '@/components/common/Tabs';
import { AdminConfirmationModal } from '@/components/admin/dashboard';
import {
	FlaggedItems,
	ModerationApiResponse,
	UnflagResponse,
	EventDeleteResponse,
	UserStatusUpdateResponse,
} from '@/types';

// Modal state types
type UserUnflagModalState = {
	isOpen: boolean;
	userId: string | null;
	userName: string;
};

type EventUnflagModalState = {
	isOpen: boolean;
	eventId: string | null;
	eventTitle: string;
};

type EventDeleteModalState = {
	isOpen: boolean;
	eventId: string | null;
	eventTitle: string;
};

const ModerationPage: React.FC = () => {
	const [flaggedItems, setFlaggedItems] = useState<FlaggedItems>({ users: [], events: [] });
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>('users');

	// Modal states
	const [userUnflagModal, setUserUnflagModal] = useState<UserUnflagModalState>({
		isOpen: false,
		userId: null,
		userName: '',
	});

	const [eventUnflagModal, setEventUnflagModal] = useState<EventUnflagModalState>({
		isOpen: false,
		eventId: null,
		eventTitle: '',
	});

	const [eventDeleteModal, setEventDeleteModal] = useState<EventDeleteModalState>({
		isOpen: false,
		eventId: null,
		eventTitle: '',
	});

	useEffect(() => {
		const fetchFlaggedItems = async (): Promise<void> => {
			try {
				setLoading(true);
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
		};

		fetchFlaggedItems();
	}, []);

	const openUserUnflagModal = (userId: string, userName: string) => {
		setUserUnflagModal({
			isOpen: true,
			userId,
			userName,
		});
	};

	const closeUserUnflagModal = () => {
		setUserUnflagModal({
			isOpen: false,
			userId: null,
			userName: '',
		});
	};

	const openEventUnflagModal = (eventId: string, eventTitle: string) => {
		setEventUnflagModal({
			isOpen: true,
			eventId,
			eventTitle,
		});
	};

	const closeEventUnflagModal = () => {
		setEventUnflagModal({
			isOpen: false,
			eventId: null,
			eventTitle: '',
		});
	};

	const openEventDeleteModal = (eventId: string, eventTitle: string) => {
		setEventDeleteModal({
			isOpen: true,
			eventId,
			eventTitle,
		});
	};

	const closeEventDeleteModal = () => {
		setEventDeleteModal({
			isOpen: false,
			eventId: null,
			eventTitle: '',
		});
	};

	const handleUnflagUser = async (userId: string): Promise<void> => {
		try {
			const response: AxiosResponse<UnflagResponse> = await axios.put(`/admin/users/${userId}/flag`, {
				isFlagged: false,
			});

			if (response.data.success) {
				setFlaggedItems({
					...flaggedItems,
					users: flaggedItems.users.filter((user) => user._id !== userId),
				});
				closeUserUnflagModal();
			}
		} catch (error) {
			console.error('Error unflagging user:', error);
			setError('Failed to unflag user. Please try again.');
		}
	};

	const handleUnflagEvent = async (eventId: string): Promise<void> => {
		try {
			const response: AxiosResponse<UnflagResponse> = await axios.put(`/admin/events/${eventId}/flag`, {
				isFlagged: false,
			});

			if (response.data.success) {
				setFlaggedItems({
					...flaggedItems,
					events: flaggedItems.events.filter((event) => event._id !== eventId),
				});
				closeEventUnflagModal();
			}
		} catch (error) {
			console.error('Error unflagging event:', error);
			setError('Failed to unflag event. Please try again.');
		}
	};

	const handleDeleteEvent = async (eventId: string): Promise<void> => {
		try {
			const response: AxiosResponse<EventDeleteResponse> = await axios.delete(`/admin/events/${eventId}`);
			if (response.data.success) {
				setFlaggedItems({
					...flaggedItems,
					events: flaggedItems.events.filter((event) => event._id !== eventId),
				});
				closeEventDeleteModal();
			}
		} catch (error) {
			console.error('Error deleting event:', error);
			setError('Failed to delete event. Please try again.');
		}
	};

	const handleSuspendUser = async (userId: string): Promise<void> => {
		try {
			const response: AxiosResponse<UserStatusUpdateResponse> = await axios.put(`/admin/users/${userId}/status`, {
				status: 'suspended',
			});

			if (response.data.success) {
				setFlaggedItems({
					...flaggedItems,
					users: flaggedItems.users.map((user) =>
						user._id === userId ? { ...user, status: 'suspended' as const } : user
					),
				});
			}
		} catch (error) {
			console.error('Error suspending user:', error);
			setError('Failed to suspend user. Please try again.');
		}
	};

	const handleActivateUser = async (userId: string): Promise<void> => {
		try {
			const response: AxiosResponse<UserStatusUpdateResponse> = await axios.put(`/admin/users/${userId}/status`, {
				status: 'active',
			});

			if (response.data.success) {
				setFlaggedItems({
					...flaggedItems,
					users: flaggedItems.users.map((user) =>
						user._id === userId ? { ...user, status: 'active' as const } : user
					),
				});
			}
		} catch (error) {
			console.error('Error activating user:', error);
			setError('Failed to activate user. Please try again.');
		}
	};

	const UserContent = () => (
		<div className="space-y-4">
			{flaggedItems.users.length > 0 ? (
				<div className="space-y-4">
					{flaggedItems.users.map((user) => (
						<div
							key={user._id}
							className="ym-bg-card ym-border-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-gradient-primary-light"
						>
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
													user.status === 'active'
														? 'bg-success-10 text-success'
														: 'bg-destructive-10 text-error'
												}`}
											>
												{user.status || 'active'}
											</span>
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="mb-4">
										<p className="text-sm ym-text-muted mb-1">Flag Reason:</p>
										<span className="text-sm font-medium text-warning bg-warning-10 px-2 py-1 rounded">
											{user.flagReason || 'No reason provided'}
										</span>
									</div>
									<div className="flex space-x-2">
										<Button
											onClick={() => openUserUnflagModal(user._id, user.name)}
											className="btn-secondary text-sm"
										>
											Unflag
										</Button>
										{user.status !== 'suspended' ? (
											<Button
												onClick={() => handleSuspendUser(user._id)}
												className="bg-warning text-sm"
											>
												Suspend
											</Button>
										) : (
											<Button
												onClick={() => handleActivateUser(user._id)}
												className="bg-success text-sm"
											>
												Activate
											</Button>
										)}
										<Link to={`/admin/users`}>
											<Button className="ym-btn-secondary text-sm">View Details</Button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<ShieldCheckIcon className="w-16 h-16 ym-text-muted mx-auto mb-4" />
					<h3 className="text-lg font-medium ym-text-primary mb-2">No Flagged Users</h3>
					<p className="ym-text-muted">All users are in good standing.</p>
				</div>
			)}
		</div>
	);

	const EventContent = () => (
		<div className="space-y-4">
			{flaggedItems.events.length > 0 ? (
				<div className="space-y-4">
					{flaggedItems.events.map((event) => (
						<div
							key={event._id}
							className="ym-bg-card ym-border-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-gradient-brand-tertiary-light"
						>
							<div className="flex items-start space-x-4">
								<img
									src={event.poster}
									alt={event.title}
									className="w-16 h-16 object-cover rounded-lg border-2 border-brand-primary shadow-sm"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											'https://via.placeholder.com/100?text=Event';
									}}
								/>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-lg font-semibold ym-text-primary mb-1">
												{event.title}
											</h3>
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
												onClick={() => openEventUnflagModal(event._id, event.title)}
												className="btn-secondary text-sm"
											>
												Unflag
											</Button>
											<Button
												onClick={() => openEventDeleteModal(event._id, event.title)}
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
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<ShieldCheckIcon className="w-16 h-16 ym-text-muted mx-auto mb-4" />
					<h3 className="text-lg font-medium ym-text-primary mb-2">No Flagged Events</h3>
					<p className="ym-text-muted">All events meet community standards.</p>
				</div>
			)}
		</div>
	);

	const tabs = [
		{
			id: 'users',
			label: `Flagged Users (${flaggedItems.users.length})`,
			icon: <UserIcon className="w-4 h-4" />,
			content: <UserContent />,
		},
		{
			id: 'events',
			label: `Flagged Events (${flaggedItems.events.length})`,
			icon: <CalendarIcon className="w-4 h-4" />,
			content: <EventContent />,
		},
	];

	return (
		<div className="min-h-screen ym-features-bg">
			<div className="max-w-7xl mx-auto p-6">
				{/* Header Section */}
				<div className="ym-bg-card ym-border-card border rounded-xl shadow-lg p-6 mb-8 bg-gradient-primary-light">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
								<ExclamationTriangleIcon className="w-6 h-6 ym-text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold ym-text-primary">Content Moderation Center</h1>
								<p className="ym-text-muted">Review and manage flagged content across the platform</p>
							</div>
						</div>
						<Link to="/admin/dashboard">
							<Button className="gradient-bg ym-text-white">← Back to Dashboard</Button>
						</Link>
					</div>
				</div>

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
					) : (
						<div className="p-6">
							{flaggedItems.users.length === 0 && flaggedItems.events.length === 0 ? (
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
							) : (
								<>
									{/* Summary Stats */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
										<div className="bg-gradient-primary-light p-4 rounded-lg border border-primary-20">
											<div className="flex items-center space-x-3">
												<UserIcon className="w-8 h-8 text-primary" />
												<div>
													<p className="text-2xl font-bold ym-text-primary">
														{flaggedItems.users.length}
													</p>
													<p className="ym-text-muted">Flagged Users</p>
												</div>
											</div>
										</div>
										<div className="bg-gradient-brand-tertiary-light p-4 rounded-lg border border-brand-tertiary border-opacity-20">
											<div className="flex items-center space-x-3">
												<CalendarIcon className="w-8 h-8 text-brand-tertiary" />
												<div>
													<p className="text-2xl font-bold ym-text-primary">
														{flaggedItems.events.length}
													</p>
													<p className="ym-text-muted">Flagged Events</p>
												</div>
											</div>
										</div>
									</div>

									{/* Tabs Content */}
									<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
								</>
							)}
						</div>
					)}
				</div>

				{/* User Unflag Confirmation Modal */}
				<AdminConfirmationModal
					modalType="flag"
					isOpen={userUnflagModal.isOpen}
					onClose={closeUserUnflagModal}
					userName={userUnflagModal.userName}
					isFlagged={true}
					flagReason=""
					onConfirm={() => userUnflagModal.userId && handleUnflagUser(userUnflagModal.userId)}
				/>

				{/* Event Unflag Confirmation Modal */}
				<AdminConfirmationModal
					modalType="flag"
					isOpen={eventUnflagModal.isOpen}
					onClose={closeEventUnflagModal}
					userName={eventUnflagModal.eventTitle}
					isFlagged={true}
					flagReason=""
					onConfirm={() => eventUnflagModal.eventId && handleUnflagEvent(eventUnflagModal.eventId)}
					context="event"
				/>

				{/* Event Delete Confirmation Modal */}
				<AdminConfirmationModal
					modalType="delete"
					isOpen={eventDeleteModal.isOpen}
					onClose={closeEventDeleteModal}
					userName={eventDeleteModal.eventTitle}
					onConfirm={() => eventDeleteModal.eventId && handleDeleteEvent(eventDeleteModal.eventId)}
					context="event"
				/>
			</div>
		</div>
	);
};

export default ModerationPage;
