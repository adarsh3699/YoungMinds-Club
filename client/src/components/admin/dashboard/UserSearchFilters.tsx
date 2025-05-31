import React, { memo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { FormInput, SelectInput } from '../../common';
import { UserSearchFiltersProps, AdminRoleOption, StatusOption } from '@/types';

const ROLE_OPTIONS: AdminRoleOption[] = [
	{ value: 'all', label: 'All Roles' },
	{ value: 'user', label: 'Users' },
	{ value: 'organizer', label: 'Organizers' },
	{ value: 'admin', label: 'Admins' },
];

const STATUS_OPTIONS: StatusOption[] = [
	{ value: 'all', label: 'All Status' },
	{ value: 'active', label: 'Active' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'flagged', label: 'Flagged' },
];

const UserSearchFilters: React.FC<UserSearchFiltersProps> = memo(
	({
		searchTerm,
		setSearchTerm,
		roleFilter,
		setRoleFilter,
		statusFilter,
		setStatusFilter,
		filteredCount,
		totalCount,
		animationDelay = '0.3s',
	}) => {
		// Show role filter only if both roleFilter and setRoleFilter are provided
		const showRoleFilter = roleFilter !== undefined && setRoleFilter !== undefined;

		const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
			setSearchTerm(e.target.value);
		};

		const handleRoleChange = (e: { target: { name: string; value: string | number } }): void => {
			if (setRoleFilter) {
				setRoleFilter(e.target.value as string);
			}
		};

		const handleStatusChange = (e: { target: { name: string; value: string | number } }): void => {
			setStatusFilter(e.target.value as string);
		};

		return (
			<div
				className="bg-card rounded-2xl shadow-xl p-6 mb-8 animate-fade-in relative z-20"
				style={{
					animationDelay,
					animationFillMode: 'both',
				}}
			>
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Input */}
					<div className="flex-1">
						<FormInput
							type="text"
							name="search"
							placeholder="Search users by name or email..."
							value={searchTerm}
							onChange={handleSearchChange}
							icon={<MagnifyingGlassIcon className="w-5 h-5" />}
							className="w-full"
						/>
					</div>

					{/* Role Filter - Conditionally rendered */}
					{showRoleFilter && (
						<div className="min-w-[180px]">
							<SelectInput
								name="roleFilter"
								value={roleFilter}
								onChange={handleRoleChange}
								options={ROLE_OPTIONS}
								className="w-full"
							/>
						</div>
					)}

					{/* Status Filter */}
					<div className="min-w-[180px]">
						<SelectInput
							name="statusFilter"
							value={statusFilter}
							onChange={handleStatusChange}
							options={STATUS_OPTIONS}
							className="w-full"
						/>
					</div>
				</div>

				{/* Results Count */}
				<div className="mt-4 text-sm text-muted-foreground transition-all duration-200">
					Showing {filteredCount} of {totalCount} users
				</div>
			</div>
		);
	}
);

UserSearchFilters.displayName = 'UserSearchFilters';

export default UserSearchFilters; 