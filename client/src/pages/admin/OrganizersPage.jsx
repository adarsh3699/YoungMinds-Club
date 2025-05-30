import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
	StatsCard,
	LoadingComponent,
	UsersTable,
	UserSearchFilters,
	AdminConfirmationModal,
	AdminPageHeader,
} from '../../components/admin/dashboard';
import {
	ExclamationTriangleIcon,
	UserGroupIcon,
	CalendarIcon,
	FlagIcon,
	ShieldCheckIcon,
	UserIcon,
	NoSymbolIcon,
	ArrowDownIcon,
} from '@heroicons/react/24/outline';

// Constants
const INITIAL_ADMIN_MODAL = {
	isOpen: false,
	type: null,
	organizerId: null,
	organizerName: '',
	currentStatus: '',
	isFlagged: false,
	flagReason: '',
};

const STATUS_FILTERS = {
	ALL: 'all',
	ACTIVE: 'active',
	SUSPENDED: 'suspended',
	FLAGGED: 'flagged',
};

const USER_STATUSES = {
	ACTIVE: 'active',
	SUSPENDED: 'suspended',
};

const MODAL_TYPES = {
	STATUS: 'status',
	FLAG: 'flag',
	DEMOTE: 'demote',
};

const OrganizersPage = () => {
	const [organizers, setOrganizers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [adminModal, setAdminModal] = useState(INITIAL_ADMIN_MODAL);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL);

	// Memoized filtered organizers
	const filteredOrganizers = useMemo(() => {
		return organizers.filter((organizer) => {
			const matchesSearch =
				organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				organizer.email.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus =
				statusFilter === STATUS_FILTERS.ALL ||
				(statusFilter === STATUS_FILTERS.ACTIVE &&
					(organizer.status === USER_STATUSES.ACTIVE || !organizer.status)) ||
				(statusFilter === STATUS_FILTERS.SUSPENDED && organizer.status === USER_STATUSES.SUSPENDED) ||
				(statusFilter === STATUS_FILTERS.FLAGGED && organizer.isFlagged);

			return matchesSearch && matchesStatus;
		});
	}, [organizers, searchTerm, statusFilter]);

	// Memoized organizer statistics
	const organizerStats = useMemo(
		() => ({
			total: organizers.length,
			active: organizers.filter((org) => org.status === USER_STATUSES.ACTIVE || !org.status).length,
			suspended: organizers.filter((org) => org.status === USER_STATUSES.SUSPENDED).length,
			flagged: organizers.filter((org) => org.isFlagged).length,
			admins: 0, // Not applicable for organizers page
			organizers: organizers.length, // All users here are organizers
			regularUsers: 0, // Not applicable for organizers page
			totalEvents: organizers.reduce((total, org) => total + (org.eventCount || 0), 0),
		}),
		[organizers]
	);

	// Optimized data fetching with error handling
	const fetchOrganizers = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await axios.get('/admin/organizers');

			if (response.data.success) {
				setOrganizers(response.data.organizers);
			} else {
				throw new Error(response.data.message || 'Failed to fetch organizers');
			}
		} catch (error) {
			console.error('Error fetching organizers:', error);
			setError(error.response?.data?.message || 'Failed to load organizers. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchOrganizers();
	}, [fetchOrganizers]);

	// Optimized modal handlers
	const confirmStatusChange = useCallback((organizerId, organizerName, currentStatus) => {
		setAdminModal({
			isOpen: true,
			type: MODAL_TYPES.STATUS,
			organizerId,
			organizerName,
			currentStatus,
			isFlagged: false,
			flagReason: '',
		});
	}, []);

	const openFlagModal = useCallback((organizerId, organizerName, isFlagged, flagReason = '') => {
		setAdminModal({
			isOpen: true,
			type: MODAL_TYPES.FLAG,
			organizerId,
			organizerName,
			currentStatus: '',
			isFlagged,
			flagReason,
		});
	}, []);

	const confirmDemoteUser = useCallback((organizerId, organizerName) => {
		setAdminModal({
			isOpen: true,
			type: MODAL_TYPES.DEMOTE,
			organizerId,
			organizerName,
			currentStatus: '',
			isFlagged: false,
			flagReason: '',
		});
	}, []);

	const closeAdminModal = useCallback(() => {
		setAdminModal(INITIAL_ADMIN_MODAL);
	}, []);

	// Optimized status change handler
	const handleStatusChange = useCallback(async () => {
		if (!adminModal.organizerId) return;

		try {
			const newStatus =
				adminModal.currentStatus === USER_STATUSES.ACTIVE ? USER_STATUSES.SUSPENDED : USER_STATUSES.ACTIVE;
			const response = await axios.put(`/admin/users/${adminModal.organizerId}/status`, {
				status: newStatus,
			});

			if (response.data.success) {
				setOrganizers((prev) =>
					prev.map((organizer) =>
						organizer._id === adminModal.organizerId ? { ...organizer, status: newStatus } : organizer
					)
				);
				closeAdminModal();
			} else {
				throw new Error(response.data.message || 'Failed to update status');
			}
		} catch (error) {
			console.error('Error updating organizer status:', error);
			setError(error.response?.data?.message || 'Failed to update organizer status. Please try again.');
		}
	}, [adminModal.organizerId, adminModal.currentStatus, closeAdminModal]);

	// Optimized flag handler
	const handleFlagOrganizer = useCallback(async () => {
		if (!adminModal.organizerId) return;

		try {
			const response = await axios.put(`/admin/users/${adminModal.organizerId}/flag`, {
				isFlagged: !adminModal.isFlagged,
				flagReason: adminModal.flagReason,
			});

			if (response.data.success) {
				setOrganizers((prev) =>
					prev.map((organizer) =>
						organizer._id === adminModal.organizerId
							? {
									...organizer,
									isFlagged: !adminModal.isFlagged,
									flagReason: !adminModal.isFlagged ? adminModal.flagReason : null,
							  }
							: organizer
					)
				);
				closeAdminModal();
			} else {
				throw new Error(response.data.message || 'Failed to update flag status');
			}
		} catch (error) {
			console.error('Error updating organizer flag status:', error);
			setError(error.response?.data?.message || 'Failed to update organizer flag status. Please try again.');
		}
	}, [adminModal.organizerId, adminModal.isFlagged, adminModal.flagReason, closeAdminModal]);

	// Optimized role change handler (demote)
	const handleDemoteUser = useCallback(async () => {
		if (!adminModal.organizerId) return;

		try {
			const response = await axios.put(`/admin/users/${adminModal.organizerId}/role`, {
				role: 'user',
			});

			if (response.data.success) {
				setOrganizers((prev) => prev.filter((org) => org._id !== adminModal.organizerId));
				closeAdminModal();
			} else {
				throw new Error(response.data.message || 'Failed to change role');
			}
		} catch (error) {
			console.error('Error changing organizer to user:', error);
			setError(error.response?.data?.message || 'Failed to change role. Please try again.');
		}
	}, [adminModal.organizerId, closeAdminModal]);

	const handleFlagReasonChange = useCallback((e) => {
		setAdminModal((prev) => ({ ...prev, flagReason: e.target.value }));
	}, []);

	// Unified confirm handler for all modal types
	const handleModalConfirm = useCallback(() => {
		switch (adminModal.type) {
			case MODAL_TYPES.STATUS:
				return handleStatusChange();
			case MODAL_TYPES.FLAG:
				return handleFlagOrganizer();
			case MODAL_TYPES.DEMOTE:
				return handleDemoteUser();
			default:
				return;
		}
	}, [adminModal.type, handleStatusChange, handleFlagOrganizer, handleDemoteUser]);

	// Memoized render function for organizer rows
	const renderOrganizerRow = useCallback(
		(organizer, index) => {
			const isActive = organizer.status === USER_STATUSES.ACTIVE || !organizer.status;
			const isSuspended = organizer.status === USER_STATUSES.SUSPENDED;

			return (
				<tr
					key={organizer._id}
					className={`hover:bg-surface-secondary/50 transition-colors ${
						organizer.isFlagged ? 'bg-destructive/5' : ''
					}`}
				>
					<td className="px-6 py-4">
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0">
								<div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-brand-light/20 rounded-full flex items-center justify-center">
									<UserIcon className="h-5 w-5 text-primary" />
								</div>
							</div>
							<div>
								<div className="flex items-center space-x-2">
									<span className="text-sm font-medium text-card-foreground">{organizer.name}</span>
									{organizer.isFlagged && (
										<span className="inline-flex items-center px-2 py-1 text-xs bg-destructive/20 text-destructive rounded-full">
											<FlagIcon className="h-3 w-3 mr-1" />
											Flagged
										</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground">ID: {organizer._id.slice(-8)}</p>
							</div>
						</div>
					</td>
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">{organizer.email}</div>
						{organizer.organizationName && (
							<div className="text-xs text-muted-foreground">{organizer.organizationName}</div>
						)}
					</td>
					<td className="px-6 py-4">
						<span className="inline-flex items-center px-2.5 py-1 text-xs bg-indigo/10 text-indigo rounded-full">
							<CalendarIcon className="h-3 w-3 mr-1" />
							{organizer.eventCount || 0} events
						</span>
					</td>
					<td className="px-6 py-4">
						<span
							className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${
								isActive ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
							}`}
						>
							{isActive ? (
								<ShieldCheckIcon className="h-3 w-3 mr-1" />
							) : (
								<NoSymbolIcon className="h-3 w-3 mr-1" />
							)}
							{organizer.status || USER_STATUSES.ACTIVE}
						</span>
					</td>
					<td className="px-6 py-4">
						<div className="flex items-center space-x-2">
							<button
								onClick={() =>
									confirmStatusChange(
										organizer._id,
										organizer.name,
										organizer.status || USER_STATUSES.ACTIVE
									)
								}
								className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all ${
									isSuspended
										? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
										: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
								}`}
							>
								{isSuspended ? 'Activate' : 'Suspend'}
							</button>

							<button
								onClick={() =>
									openFlagModal(
										organizer._id,
										organizer.name,
										organizer.isFlagged,
										organizer.flagReason
									)
								}
								className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all ${
									organizer.isFlagged
										? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
										: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
								}`}
							>
								<FlagIcon className="h-3 w-3 mr-1" />
								{organizer.isFlagged ? 'Unflag' : 'Flag'}
							</button>

							<button
								onClick={() => confirmDemoteUser(organizer._id, organizer.name)}
								className="inline-flex items-center px-3 py-1.5 text-xs bg-purple/10 text-purple border border-purple/20 rounded-lg hover:bg-purple/20 transition-all"
							>
								<ArrowDownIcon className="h-3 w-3 mr-1" />
								Demote
							</button>
						</div>
					</td>
				</tr>
			);
		},
		[confirmStatusChange, openFlagModal, confirmDemoteUser]
	);

	// Memoized stats cards data
	const statsCardsData = useMemo(
		() => [
			{
				title: 'Total Organizers',
				value: organizerStats.total,
				description: 'All registered organizers',
				icon: <UserGroupIcon className="h-6 w-6 text-primary" />,
				bgClass: 'bg-gradient-primary-light',
				borderClass: 'border-primary/20',
				iconBgClass: 'bg-primary-5',
			},
			{
				title: 'Active',
				value: organizerStats.active,
				description: 'Currently active',
				icon: <ShieldCheckIcon className="h-6 w-6 text-success" />,
				bgClass: 'bg-gradient-success-light',
				borderClass: 'border-success/20',
				iconBgClass: 'bg-success-5',
			},
			{
				title: 'Suspended',
				value: organizerStats.suspended,
				description: 'Temporarily suspended',
				icon: <NoSymbolIcon className="h-6 w-6 text-warning" />,
				bgClass: 'bg-gradient-brand-tertiary-light',
				borderClass: 'border-warning/20',
				iconBgClass: 'bg-destructive-10',
			},
			{
				title: 'Flagged',
				value: organizerStats.flagged,
				description: 'Requiring attention',
				icon: <FlagIcon className="h-6 w-6 text-destructive" />,
				bgClass: 'bg-gradient-brand-primary-light',
				borderClass: 'border-destructive/20',
				iconBgClass: 'bg-warning-10',
			},
			{
				title: 'Total Events',
				value: organizerStats.totalEvents,
				description: 'Events organized',
				icon: <CalendarIcon className="h-6 w-6 text-indigo" />,
				bgClass: 'bg-gradient-indigo-light',
				borderClass: 'border-indigo/20',
				iconBgClass: 'bg-indigo-10',
			},
		],
		[organizerStats]
	);

	// Clear error when user interacts
	const clearError = useCallback(() => setError(null), []);

	if (loading) return <LoadingComponent />;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="max-w-7xl mx-auto p-6">
				{/* Organizers Header */}
				<AdminPageHeader
					icon={<UserGroupIcon className="w-8 h-8" />}
					title="Organizers Management"
					description="Manage event organizers, their status, and permissions"
					iconBgColor="text-success"
				/>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
					{statsCardsData.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>

				{/* Search and Filters */}
				<UserSearchFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					filteredCount={filteredOrganizers.length}
					totalCount={organizers.length}
				/>

				{/* Error Alert */}
				{error && (
					<div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span className="flex-1">{error}</span>
						<button
							onClick={clearError}
							className="text-destructive hover:text-destructive/80 font-medium text-sm"
						>
							Dismiss
						</button>
					</div>
				)}

				{/* Organizers Table */}
				<UsersTable
					loading={loading}
					filteredUsers={filteredOrganizers}
					searchTerm={searchTerm}
					roleFilter="organizer"
					statusFilter={statusFilter}
					renderUserRow={renderOrganizerRow}
				/>

				{/* Spacer */}
				<div className="h-32" />

				{/* Unified Admin Confirmation Modal for all actions */}
				<AdminConfirmationModal
					modalType={adminModal.type}
					isOpen={adminModal.isOpen}
					onClose={closeAdminModal}
					userName={adminModal.organizerName}
					currentStatus={adminModal.currentStatus}
					isFlagged={adminModal.isFlagged}
					flagReason={adminModal.flagReason}
					onFlagReasonChange={handleFlagReasonChange}
					onConfirm={handleModalConfirm}
				/>
			</div>
		</div>
	);
};

export default OrganizersPage;
