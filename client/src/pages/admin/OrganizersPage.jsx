import { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../../components/common';
import {
	StatsCard,
	LoadingComponent,
	UsersTable,
	UserSearchFilters,
	AdminUserModal,
	AdminPageHeader,
} from '../../components/admin/dashboard';
import {
	ExclamationTriangleIcon,
	UserGroupIcon,
	CalendarIcon,
	FlagIcon,
	ShieldCheckIcon,
	UserIcon,
	EyeIcon,
	NoSymbolIcon,
	ArrowDownIcon,
} from '@heroicons/react/24/outline';

const OrganizersPage = () => {
	const [organizers, setOrganizers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [adminModal, setAdminModal] = useState({
		isOpen: false,
		type: null,
		organizerId: null,
		organizerName: '',
		currentStatus: '',
		isFlagged: false,
		flagReason: '',
	});
	const [demoteModal, setDemoteModal] = useState({
		isOpen: false,
		organizerId: null,
		organizerName: '',
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter] = useState('organizer');
	const [statusFilter, setStatusFilter] = useState('all');

	useEffect(() => {
		const fetchOrganizers = async () => {
			try {
				setLoading(true);
				const response = await axios.get('/admin/organizers');
				if (response.data.success) {
					setOrganizers(response.data.organizers);
				}
			} catch (error) {
				console.error('Error fetching organizers:', error);
				setError('Failed to load organizers. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchOrganizers();
	}, []);

	// Filter organizers based on search and status
	const filteredOrganizers = organizers.filter((organizer) => {
		const matchesSearch =
			organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === 'all' ||
			(statusFilter === 'active' && (organizer.status === 'active' || !organizer.status)) ||
			(statusFilter === 'suspended' && organizer.status === 'suspended') ||
			(statusFilter === 'flagged' && organizer.isFlagged);
		return matchesSearch && matchesStatus;
	});

	// Calculate stats for UserStatsCards (matching the expected structure)
	const organizerStats = {
		total: organizers.length,
		active: organizers.filter((org) => org.status === 'active' || !org.status).length,
		suspended: organizers.filter((org) => org.status === 'suspended').length,
		flagged: organizers.filter((org) => org.isFlagged).length,
		admins: 0, // Not applicable for organizers page
		organizers: organizers.length, // All users here are organizers
		regularUsers: 0, // Not applicable for organizers page
		totalEvents: 0, // Assuming totalEvents is not provided in the original code
	};

	const confirmStatusChange = (organizerId, organizerName, currentStatus) => {
		setAdminModal({
			isOpen: true,
			type: 'status',
			organizerId,
			organizerName,
			currentStatus,
			isFlagged: false,
			flagReason: '',
		});
	};

	const handleStatusChange = async () => {
		try {
			const newStatus = adminModal.currentStatus === 'active' ? 'suspended' : 'active';
			const response = await axios.put(`/admin/users/${adminModal.organizerId}/status`, {
				status: newStatus,
			});

			if (response.data.success) {
				// Update the organizer in the list
				setOrganizers(
					organizers.map((organizer) =>
						organizer._id === adminModal.organizerId ? { ...organizer, status: newStatus } : organizer
					)
				);
				closeAdminModal();
			}
		} catch (error) {
			console.error('Error updating organizer status:', error);
			setError('Failed to update organizer status. Please try again.');
		}
	};

	const closeAdminModal = () => {
		setAdminModal({
			isOpen: false,
			type: null,
			organizerId: null,
			organizerName: '',
			currentStatus: '',
			isFlagged: false,
			flagReason: '',
		});
	};

	const openFlagModal = (organizerId, organizerName, isFlagged, flagReason = '') => {
		setAdminModal({
			isOpen: true,
			type: 'flag',
			organizerId,
			organizerName,
			currentStatus: '',
			isFlagged,
			flagReason,
		});
	};

	const handleFlagOrganizer = async () => {
		try {
			const response = await axios.put(`/admin/users/${adminModal.organizerId}/flag`, {
				isFlagged: !adminModal.isFlagged,
				flagReason: adminModal.flagReason,
			});

			if (response.data.success) {
				// Update the organizer in the list
				setOrganizers(
					organizers.map((organizer) =>
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
			}
		} catch (error) {
			console.error('Error updating organizer flag status:', error);
			setError('Failed to update organizer flag status. Please try again.');
		}
	};

	const handleFlagReasonChange = (e) => {
		setAdminModal({ ...adminModal, flagReason: e.target.value });
	};

	const changeToUser = async (organizerId) => {
		try {
			const response = await axios.put(`/admin/users/${organizerId}/role`, {
				role: 'user',
			});

			if (response.data.success) {
				// Remove the organizer from the list as they're now a user
				setOrganizers(organizers.filter((org) => org._id !== organizerId));
				setDemoteModal({ isOpen: false, organizerId: null, organizerName: '' });
			}
		} catch (error) {
			console.error('Error changing organizer to user:', error);
			setError('Failed to change role. Please try again.');
		}
	};

	const confirmDemoteUser = (organizerId, organizerName) => {
		setDemoteModal({ isOpen: true, organizerId, organizerName });
	};

	const handleDemoteUser = () => {
		changeToUser(demoteModal.organizerId);
	};

	const closeDemoteModal = () => {
		setDemoteModal({ isOpen: false, organizerId: null, organizerName: '' });
	};

	// Custom render function for organizer rows
	const renderOrganizerRow = (organizer, index) => (
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
						organizer.status === 'active' || !organizer.status
							? 'bg-success/10 text-success'
							: 'bg-warning/10 text-warning'
					}`}
				>
					{organizer.status === 'active' || !organizer.status ? (
						<ShieldCheckIcon className="h-3 w-3 mr-1" />
					) : (
						<NoSymbolIcon className="h-3 w-3 mr-1" />
					)}
					{organizer.status || 'active'}
				</span>
			</td>
			<td className="px-6 py-4">
				<div className="flex items-center space-x-2">
					<button
						onClick={() => confirmStatusChange(organizer._id, organizer.name, organizer.status || 'active')}
						className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all ${
							organizer.status === 'suspended'
								? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
								: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
						}`}
					>
						{organizer.status === 'suspended' ? 'Activate' : 'Suspend'}
					</button>

					<button
						onClick={() =>
							openFlagModal(organizer._id, organizer.name, organizer.isFlagged, organizer.flagReason)
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
					<StatsCard
						title="Total Organizers"
						value={organizerStats.total}
						description="All registered organizers"
						icon={<UserGroupIcon className="h-6 w-6 text-primary" />}
						bgClass="bg-gradient-primary-light"
						borderClass="border-primary/20"
						iconBgClass="bg-primary-5"
					/>
					<StatsCard
						title="Active"
						value={organizerStats.active}
						description="Currently active"
						icon={<ShieldCheckIcon className="h-6 w-6 text-success" />}
						bgClass="bg-gradient-success-light"
						borderClass="border-success/20"
						iconBgClass="bg-success-5"
					/>
					<StatsCard
						title="Suspended"
						value={organizerStats.suspended}
						description="Temporarily suspended"
						icon={<NoSymbolIcon className="h-6 w-6 text-warning" />}
						bgClass="bg-gradient-brand-tertiary-light"
						borderClass="border-warning/20"
						iconBgClass="bg-destructive-10"
					/>
					<StatsCard
						title="Flagged"
						value={organizerStats.flagged}
						description="Requiring attention"
						icon={<FlagIcon className="h-6 w-6 text-destructive" />}
						bgClass="bg-gradient-brand-primary-light"
						borderClass="border-destructive/20"
						iconBgClass="bg-warning-10"
					/>
					<StatsCard
						title="Total Events"
						value={organizerStats.totalEvents}
						description="Events organized"
						icon={<CalendarIcon className="h-6 w-6 text-indigo" />}
						bgClass="bg-gradient-indigo-light"
						borderClass="border-indigo/20"
						iconBgClass="bg-indigo-10"
					/>
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
						<span>{error}</span>
					</div>
				)}

				{/* Organizers Table */}
				<UsersTable
					loading={loading}
					filteredUsers={filteredOrganizers}
					searchTerm={searchTerm}
					roleFilter={roleFilter}
					statusFilter={statusFilter}
					renderUserRow={renderOrganizerRow}
				/>

				{/* Spacer */}
				<div className="h-32" />

				{/* Admin User Modal for Status and Flag actions */}
				<AdminUserModal
					modalType={adminModal.type}
					isOpen={adminModal.isOpen}
					onClose={closeAdminModal}
					userName={adminModal.organizerName}
					currentStatus={adminModal.currentStatus}
					isFlagged={adminModal.isFlagged}
					flagReason={adminModal.flagReason}
					onFlagReasonChange={handleFlagReasonChange}
					onConfirm={adminModal.type === 'status' ? handleStatusChange : handleFlagOrganizer}
				/>

				{/* Demote Modal */}
				<Modal
					isOpen={demoteModal.isOpen}
					onClose={closeDemoteModal}
					title="Demote Organizer"
					maxWidth="max-w-md"
				>
					<div className="mt-2">
						<div className="flex items-center justify-center w-12 h-12 mx-auto bg-warning/10 rounded-full">
							<ArrowDownIcon className="w-6 h-6 text-warning" aria-hidden="true" />
						</div>
						<div className="mt-3 text-center sm:mt-5">
							<h3 className="text-lg font-semibold text-card-foreground mb-2">Demote to Regular User</h3>
							<p className="text-muted-foreground mb-4">
								Are you sure you want to demote "{demoteModal.organizerName}" to a regular user?
							</p>
							<div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-left">
								<p className="text-sm text-warning font-medium mb-2">⚠️ This action will:</p>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li>• Remove organizer privileges</li>
									<li>• Convert to regular user account</li>
									<li>• Retain all created events and data</li>
									<li>• Lose ability to create new events</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-6 flex gap-3">
						<button
							type="button"
							className="flex-1 px-4 py-2 bg-background border border-border text-card-foreground rounded-lg hover:bg-surface-secondary transition-all"
							onClick={closeDemoteModal}
						>
							Cancel
						</button>
						<button
							type="button"
							className="flex-1 px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/80 transition-all"
							onClick={handleDemoteUser}
						>
							Demote to User
						</button>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default OrganizersPage;
