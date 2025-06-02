import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios, { AxiosResponse } from 'axios';
import {
	UserStatsCards,
	UserSearchFilters,
	UsersTable,
	AdminConfirmationModal,
	AdminPageHeader,
} from '../../components/admin/dashboard';
import {
	ExclamationTriangleIcon,
	UserGroupIcon,
	ChevronDownIcon,
	UserIcon,
	ShieldCheckIcon,
	TrashIcon,
	EyeSlashIcon,
	EyeIcon,
	FlagIcon,
} from '@heroicons/react/24/outline';
import {
	UserData,
	UserModalState,
	StatusBadgeStyle,
	RoleOption,
	UserRowProps,
	UsersApiResponse,
	UserRoleUpdateResponse,
	UserStatusUpdateResponse,
	UserFlagUpdateResponse,
	UserDeleteResponse,
	AdminConfirmationModalProps
} from '@/types';

// Constants
const ROLE_OPTIONS = [
	{ value: '', label: 'All Roles' },
	{ value: 'user', label: 'User' },
	{ value: 'organizer', label: 'Organizer' },
	{ value: 'admin', label: 'Admin' },
];

// Optimized helper functions
const getStatusBadgeStyle = (status?: string): StatusBadgeStyle => {
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

const getActionButtonClass = (type: string, condition: boolean = true): string => {
	const base =
		'px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-1';
	switch (type) {
		case 'suspend':
			return `${base} ${
				condition
					? 'bg-success hover:bg-success/80 text-white shadow-lg'
					: 'bg-warning hover:bg-warning/80 text-white shadow-lg'
			}`;
		case 'flag':
			return `${base} bg-info hover:bg-info/80 text-white shadow-lg`;
		case 'delete':
			return `${base} bg-destructive hover:bg-destructive/80 text-white shadow-lg`;
		default:
			return base;
	}
};

// Optimized UserRow Component
const UserRow: React.FC<UserRowProps> = ({ userData, index, user, onRoleChange, onStatusChange, onFlag, onDelete, isInitialLoad }) => {
	const statusStyle = getStatusBadgeStyle(userData.status);
	const canModify = userData._id !== user?._id && userData.role !== 'admin';
	const isProtected = userData._id === user?._id || userData.role === 'admin';

	return (
		<tr
			className={`hover:bg-muted/30 transition-all duration-200 ${
				userData.isFlagged ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''
			} ${isInitialLoad ? 'animate-fade-in' : ''}`}
			style={{
				animationDelay: isInitialLoad ? `${Math.min(0.1 + index * 0.025, 0.7)}s` : '0s',
				animationFillMode: 'both',
			}}
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
							onChange={(e) => onRoleChange(userData._id, e.target.value)}
							disabled={isProtected}
							className="input-base text-sm py-2 px-3 pr-8 rounded-lg border-2 focus:border-primary transition-all duration-200 appearance-none bg-card cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
						>
							{ROLE_OPTIONS.map((option) => (
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
								onClick={() => onStatusChange(userData._id, userData.name, userData.status || 'active')}
								className={getActionButtonClass('suspend', userData.status === 'suspended')}
							>
								{userData.status === 'suspended' ? 'Activate' : 'Suspend'}
							</button>
							<button
								onClick={() =>
									onFlag(userData._id, userData.name, userData.isFlagged || false, userData.flagReason || undefined)
								}
								className={getActionButtonClass('flag')}
							>
								<FlagIcon className="w-3 h-3" />
								{userData.isFlagged ? 'Unflag' : 'Flag'}
							</button>
							<button
								onClick={() => onDelete(userData._id, userData.name)}
								className={getActionButtonClass('delete')}
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
};

const UsersPage: React.FC = () => {
	const { user } = useAuth();
	const [users, setUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

	// Simplified modal state
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

	// Optimized calculations with better performance
	const filteredUsers = useMemo(() => {
		if (!users.length) return [];

		return users.filter((userData) => {
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				!searchTerm ||
				userData.name.toLowerCase().includes(searchLower) ||
				userData.email.toLowerCase().includes(searchLower);

			const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'flagged' && userData.isFlagged) ||
				(statusFilter !== 'flagged' && (userData.status || 'active') === statusFilter);

			return matchesSearch && matchesRole && matchesStatus;
		});
	}, [users, searchTerm, roleFilter, statusFilter]);

	const userStats = useMemo(() => {
		if (!users.length)
			return { total: 0, active: 0, suspended: 0, flagged: 0, admins: 0, organizers: 0, regularUsers: 0 };

		return users.reduce(
			(stats, u) => {
				const status = u.status || 'active';
				return {
					total: stats.total + 1,
					active: stats.active + (status === 'active' ? 1 : 0),
					suspended: stats.suspended + (status === 'suspended' ? 1 : 0),
					flagged: stats.flagged + (u.isFlagged ? 1 : 0),
					admins: stats.admins + (u.role === 'admin' ? 1 : 0),
					organizers: stats.organizers + (u.role === 'organizer' ? 1 : 0),
					regularUsers: stats.regularUsers + (u.role === 'user' ? 1 : 0),
				};
			},
			{ total: 0, active: 0, suspended: 0, flagged: 0, admins: 0, organizers: 0, regularUsers: 0 }
		);
	}, [users]);

	// Optimized API calls
	const fetchUsers = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			const response: AxiosResponse<UsersApiResponse> = await axios.get('/admin/users');
			if (response.data.success) {
				setUsers(response.data.users);
				// Reset initial load flag after animation completes
				setTimeout(() => setIsInitialLoad(false), 1200);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			setError('Failed to load users. Please try again later.');
		} finally {
			setLoading(false);
		}
	}, []);

	const handleRoleChange = useCallback(async (userId: string, newRole: string): Promise<void> => {
		try {
			const response: AxiosResponse<UserRoleUpdateResponse> = await axios.put(`/admin/users/${userId}/role`, { role: newRole });
			if (response.data.success) {
				setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole as 'user' | 'organizer' | 'admin' } : u)));
			}
		} catch (error) {
			console.error('Error updating user role:', error);
			setError('Failed to update user role. Please try again.');
		}
	}, []);

	// Simplified modal handlers
	const openModal = useCallback((type: 'delete' | 'status' | 'flag', userId: string, userName: string, extra: Partial<UserModalState> = {}): void => {
		setModal({
			isOpen: true,
			type,
			userId,
			userName,
			deleteAllData: true,
			currentStatus: '',
			isFlagged: false,
			flagReason: '',
			...extra,
		});
	}, []);

	const closeModal = useCallback((): void => {
		setModal((prev) => ({ ...prev, isOpen: false, type: null }));
	}, []);

	const handleModalAction = useCallback(async (): Promise<void> => {
		try {
			const { type, userId } = modal;
			let response: AxiosResponse<any>;

			switch (type) {
				case 'delete':
					response = await axios.delete(`/admin/users/${userId}`, {
						data: { deleteAllData: modal.deleteAllData },
					});
					if (response.data.success) {
						setUsers((prev) => prev.filter((u) => u._id !== userId));
					}
					break;

				case 'status':
					const newStatus = modal.currentStatus === 'active' ? 'suspended' : 'active';
					response = await axios.put(`/admin/users/${userId}/status`, { status: newStatus });
					if (response.data.success) {
						setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: newStatus as 'active' | 'suspended' } : u)));
					}
					break;

				case 'flag':
					response = await axios.put(`/admin/users/${userId}/flag`, {
						isFlagged: !modal.isFlagged,
						flagReason: modal.flagReason,
					});
					if (response.data.success) {
						setUsers((prev) =>
							prev.map((u) =>
								u._id === userId
									? {
											...u,
											isFlagged: !modal.isFlagged,
											flagReason: !modal.isFlagged ? modal.flagReason : null,
									  }
									: u
							)
						);
					}
					break;
			}
			closeModal();
		} catch (error) {
			console.error(`Error executing ${modal.type} action:`, error);
			setError(`Failed to ${modal.type} user. Please try again.`);
		}
	}, [modal, closeModal]);

	// Optimized render functions
	const renderUserRow = useCallback(
		(userData: UserData, index: number) => (
			<UserRow
				key={userData._id}
				userData={userData}
				index={index}
				user={user}
				onRoleChange={handleRoleChange}
				onStatusChange={(id, name, status) => openModal('status', id, name, { currentStatus: status })}
				onFlag={(id, name, isFlagged, flagReason) => openModal('flag', id, name, { isFlagged, flagReason })}
				onDelete={(id, name) => openModal('delete', id, name)}
				isInitialLoad={isInitialLoad}
			/>
		),
		[user, handleRoleChange, openModal, isInitialLoad]
	);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="max-w-7xl mx-auto p-6">
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
				<UserSearchFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					roleFilter={roleFilter}
					setRoleFilter={setRoleFilter}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					filteredCount={filteredUsers.length}
					totalCount={users.length}
				/>

				{/* Error Message */}
				{error && (
					<div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Users Table */}
				<UsersTable
					loading={loading}
					filteredUsers={filteredUsers}
					searchTerm={searchTerm}
					roleFilter={roleFilter}
					statusFilter={statusFilter}
					renderUserRow={renderUserRow}
				/>

				{/* Spacer */}
				<div className="h-32" />

				{/* Optimized Modal */}
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
					onConfirm={handleModalAction}
				/>
			</div>
		</div>
	);
};

export default UsersPage;
