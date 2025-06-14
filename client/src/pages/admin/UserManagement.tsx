import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { UserStatsCards, AdminTable, AdminConfirmationModal, AdminPageHeader } from '../../components/admin/dashboard';
import { SearchAndFilter } from '../../components/common';
import {
	ExclamationTriangleIcon,
	UserGroupIcon,
	ChevronDownIcon,
	TrashIcon,
	EyeSlashIcon,
	EyeIcon,
	FlagIcon,
} from '@heroicons/react/24/outline';
import { UserData } from '@/types';

// Simple modal state type
type UserModalState = {
	isOpen: boolean;
	type: 'delete' | 'status' | 'flag' | null;
	userId: string | null;
	userName: string;
	deleteAllData: boolean;
	currentStatus: string;
	isFlagged: boolean;
	flagReason: string;
};

// Optimized helper functions
const getStatusBadgeStyle = (status?: string) => {
	const isActive = status === 'active' || !status;
	return {
		className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
			isActive
				? 'bg-success/10 text-success border border-success/20'
				: 'bg-destructive/10 text-destructive border border-destructive/20'
		}`,
		icon: isActive ? <EyeIcon className="w-3 h-3 mr-1" /> : <EyeSlashIcon className="w-3 h-3 mr-1" />,
		text: status || 'active',
	};
};

const UserManagement: React.FC = () => {
	const { user } = useAuth();

	// State
	const [users, setUsers] = useState<UserData[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modal, setModal] = useState<UserModalState>({
		isOpen: false,
		type: null,
		userId: null,
		userName: '',
		deleteAllData: true,
		currentStatus: '',
		isFlagged: false,
		flagReason: '',
	});

	// Filter options
	const roleOptions = [
		{ value: 'all', label: 'All Roles' },
		{ value: 'user', label: 'Users' },
		{ value: 'organizer', label: 'Organizers' },
		{ value: 'admin', label: 'Admins' },
	];

	const statusOptions = [
		{ value: 'all', label: 'All Status' },
		{ value: 'active', label: 'Active' },
		{ value: 'suspended', label: 'Suspended' },
		{ value: 'flagged', label: 'Flagged' },
	];

	// Table columns
	const columns = [
		{ key: 'user', label: 'User' },
		{ key: 'email', label: 'Email' },
		{ key: 'role', label: 'Role' },
		{ key: 'status', label: 'Status' },
		{ key: 'actions', label: 'Actions' },
	];

	// Empty state config
	const emptyStateConfig = {
		icon: <UserGroupIcon className="w-16 h-16 text-muted-foreground/50" />,
		title: 'No users found',
		description: 'Try adjusting your search or filters',
		noFiltersDescription: 'No users have been registered yet',
	};

	// Optimized stats calculation
	const userStats = useMemo(() => {
		const total = users.length;
		const active = users.filter((u) => (u.status || 'active') === 'active').length;
		const suspended = users.filter((u) => u.status === 'suspended').length;
		const flagged = users.filter((u) => u.isFlagged).length;
		const admins = users.filter((u) => u.role === 'admin').length;
		const organizers = users.filter((u) => u.role === 'organizer').length;
		const regularUsers = users.filter((u) => u.role === 'user').length;

		return {
			total,
			active,
			suspended,
			flagged,
			admins,
			organizers,
			regularUsers,
		};
	}, [users]);

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = (filtered: any[]) => {
		setFilteredUsers(filtered as UserData[]);
	};

	// API functions
	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await axios.get('/admin/users');
			if (data.success) {
				setUsers(data.users);
				setFilteredUsers(data.users);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			setError('Failed to load users. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, []);

	const updateUserRole = useCallback(async (userId: string, newRole: string) => {
		try {
			const { data } = await axios.put(`/admin/users/${userId}/role`, { role: newRole });
			if (data.success) {
				setUsers((prev) =>
					prev.map((u) => (u._id === userId ? { ...u, role: newRole as 'user' | 'organizer' | 'admin' } : u))
				);
			}
		} catch (error) {
			console.error('Error updating user role:', error);
			setError('Failed to update user role. Please try again.');
		}
	}, []);

	const deleteUser = useCallback(async () => {
		if (!modal.userId) return;

		try {
			const { data } = await axios.delete(`/admin/users/${modal.userId}`, {
				data: { deleteAllData: modal.deleteAllData },
			});
			if (data.success) {
				setUsers((prev) => prev.filter((u) => u._id !== modal.userId));
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			setError('Failed to delete user. Please try again.');
		}
	}, [modal.userId, modal.deleteAllData]);

	const toggleUserStatus = useCallback(async () => {
		if (!modal.userId) return;

		try {
			const newStatus = modal.currentStatus === 'active' ? 'suspended' : 'active';
			const { data } = await axios.put(`/admin/users/${modal.userId}/status`, { status: newStatus });
			if (data.success) {
				setUsers((prev) =>
					prev.map((u) =>
						u._id === modal.userId ? { ...u, status: newStatus as 'active' | 'suspended' } : u
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error('Error updating user status:', error);
			setError('Failed to update user status. Please try again.');
		}
	}, [modal.userId, modal.currentStatus]);

	const toggleUserFlag = useCallback(async () => {
		if (!modal.userId) return;

		try {
			const { data } = await axios.put(`/admin/users/${modal.userId}/flag`, {
				isFlagged: !modal.isFlagged,
				flagReason: modal.flagReason,
			});
			if (data.success) {
				setUsers((prev) =>
					prev.map((u) =>
						u._id === modal.userId
							? {
									...u,
									isFlagged: !modal.isFlagged,
									flagReason: !modal.isFlagged ? modal.flagReason : null,
							  }
							: u
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error('Error updating user flag status:', error);
			setError('Failed to update user flag status. Please try again.');
		}
	}, [modal.userId, modal.isFlagged, modal.flagReason]);

	// Modal handlers
	const openModal = useCallback((type: 'delete' | 'status' | 'flag', targetUser: UserData) => {
		setModal({
			isOpen: true,
			type,
			userId: targetUser._id,
			userName: targetUser.name,
			deleteAllData: true,
			currentStatus: targetUser.status || 'active',
			isFlagged: targetUser.isFlagged || false,
			flagReason: targetUser.flagReason || '',
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const handleConfirm = useCallback(() => {
		if (modal.type === 'delete') {
			deleteUser();
		} else if (modal.type === 'status') {
			toggleUserStatus();
		} else if (modal.type === 'flag') {
			toggleUserFlag();
		}
	}, [modal.type, deleteUser, toggleUserStatus, toggleUserFlag]);

	// Optimized render function
	const renderUserRow = useCallback(
		(userData: UserData) => {
			const statusStyle = getStatusBadgeStyle(userData.status);
			const canModify = userData._id !== user?._id && userData.role !== 'admin';
			const isProtected = userData._id === user?._id || userData.role === 'admin';

			return (
				<tr
					key={userData._id}
					className={`hover:bg-muted/30 transition-colors ${
						userData.isFlagged ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''
					}`}
				>
					{/* User Info */}
					<td className="py-4 px-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-brand-tertiary/20 rounded-full flex items-center justify-center">
								<span className="text-sm font-semibold text-primary">
									{userData.name.charAt(0).toUpperCase()}
								</span>
							</div>
							<div>
								<div className="font-medium text-card-foreground flex items-center gap-2">
									{userData.name}
									{userData.isFlagged && (
										<span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-full border border-destructive/20">
											<FlagIcon className="w-3 h-3" />
											Flagged
										</span>
									)}
								</div>
							</div>
						</div>
					</td>

					{/* Email */}
					<td className="py-4 px-6 text-card-foreground">{userData.email}</td>

					{/* Role */}
					<td className="py-4 px-6">
						<div className="flex items-center gap-2">
							<div className="relative">
								<select
									value={userData.role}
									onChange={(e) => updateUserRole(userData._id, e.target.value)}
									disabled={isProtected}
									className="input-base text-sm py-2 px-3 pr-8 rounded-lg border-2 focus:border-primary transition-all appearance-none bg-card cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
								>
									{roleOptions
										.filter((option) => option.value !== 'all')
										.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
								</select>
								<ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
							</div>
							{isProtected && (
								<span className="text-xs text-muted-foreground italic">
									{userData._id === user?._id ? 'Current User' : 'Protected'}
								</span>
							)}
						</div>
					</td>

					{/* Status */}
					<td className="py-4 px-6">
						<span className={statusStyle.className}>
							{statusStyle.icon}
							{statusStyle.text}
						</span>
					</td>

					{/* Actions */}
					<td className="py-4 px-6">
						<div className="flex items-center gap-2">
							{canModify ? (
								<>
									<button
										onClick={() => openModal('status', userData)}
										className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
											userData.status === 'suspended'
												? 'bg-success hover:bg-success/80 text-white'
												: 'bg-warning hover:bg-warning/80 text-white'
										}`}
									>
										{userData.status === 'suspended' ? 'Activate' : 'Suspend'}
									</button>
									<button
										onClick={() => openModal('flag', userData)}
										className="px-3 py-2 text-xs font-medium rounded-lg transition-all bg-info hover:bg-info/80 text-white flex items-center gap-1"
									>
										<FlagIcon className="w-3 h-3" />
										{userData.isFlagged ? 'Unflag' : 'Flag'}
									</button>
									<button
										onClick={() => openModal('delete', userData)}
										className="px-3 py-2 text-xs font-medium rounded-lg transition-all bg-destructive hover:bg-destructive/80 text-white flex items-center gap-1"
									>
										<TrashIcon className="w-3 h-3" />
										Delete
									</button>
								</>
							) : (
								<span className="text-xs text-muted-foreground italic">
									{userData._id === user?._id ? 'Current User' : 'Admin Protected'}
								</span>
							)}
						</div>
					</td>
				</tr>
			);
		},
		[user, updateUserRole, openModal]
	);

	// Load users on mount
	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Header */}
				<AdminPageHeader
					icon={<UserGroupIcon className="w-8 h-8" />}
					title="User Management"
					description="Manage users, roles, and permissions"
					iconBgColor="text-destructive"
				/>

				{/* Statistics Cards */}
				<UserStatsCards userStats={userStats} />

				{/* Search and Filters */}
				<SearchAndFilter
					data={users}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="users"
					searchPlaceholder="Search users by name or email..."
					roleOptions={roleOptions}
					statusOptions={statusOptions}
					showRole={true}
					showCategory={false}
					showAdvancedFilters={false}
				/>

				{/* Error Message */}
				{error && (
					<div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Users Table */}
				<AdminTable
					loading={loading}
					filteredItems={filteredUsers}
					searchTerm=""
					roleFilter="all"
					statusFilter="all"
					columns={columns}
					emptyStateConfig={emptyStateConfig}
					renderRow={renderUserRow}
				/>

				{/* Admin Confirmation Modal */}
				<AdminConfirmationModal
					modalType={modal.type || 'delete'}
					isOpen={modal.isOpen}
					onClose={closeModal}
					userName={modal.userName}
					deleteAllData={modal.deleteAllData}
					onToggleDeleteAllData={() => setModal((prev) => ({ ...prev, deleteAllData: !prev.deleteAllData }))}
					currentStatus={modal.currentStatus}
					isFlagged={modal.isFlagged}
					flagReason={modal.flagReason}
					onFlagReasonChange={(e) => setModal((prev) => ({ ...prev, flagReason: e.target.value }))}
					onConfirm={handleConfirm}
				/>
			</div>
		</div>
	);
};

export default UserManagement;
