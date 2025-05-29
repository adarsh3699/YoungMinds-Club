import { memo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { FormInput, SelectInput } from '../../common';

const ROLE_OPTIONS = [
	{ value: 'all', label: 'All Roles' },
	{ value: 'user', label: 'Users' },
	{ value: 'organizer', label: 'Organizers' },
	{ value: 'admin', label: 'Admins' },
];

const STATUS_OPTIONS = [
	{ value: 'all', label: 'All Status' },
	{ value: 'active', label: 'Active' },
	{ value: 'suspended', label: 'Suspended' },
];

const UserSearchFilters = memo(
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
							placeholder="Search users by name or email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<MagnifyingGlassIcon className="w-5 h-5" />}
							className="w-full"
						/>
					</div>

					{/* Role Filter */}
					<div className="min-w-[180px]">
						<SelectInput
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							options={ROLE_OPTIONS}
							icon={<FunnelIcon className="w-5 h-5" />}
							className="w-full"
						/>
					</div>

					{/* Status Filter */}
					<div className="min-w-[180px]">
						<SelectInput
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							options={STATUS_OPTIONS}
							icon={<ExclamationCircleIcon className="w-5 h-5" />}
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
