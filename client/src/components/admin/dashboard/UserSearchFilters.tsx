import React, { memo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FormInput, SelectInput } from '../../common';
import { UserSearchFiltersProps } from '@/types';

/**
 * Dynamic SearchFilters component that can handle any type of data
 * All filter options are passed as props - no hardcoded business logic
 */
const UserSearchFilters: React.FC<UserSearchFiltersProps> = memo(({
	searchTerm,
	setSearchTerm,
	roleFilter,
	setRoleFilter,
	statusFilter,
	setStatusFilter,
	categoryFilter,
	setCategoryFilter,
	filteredCount,
	totalCount,
	animationDelay = '0.3s',
	// Dynamic configuration props
	itemType = 'items',
	searchPlaceholder = 'Search...',
	statusOptions = [{ value: 'all', label: 'All Status' }],
	roleOptions = [{ value: 'all', label: 'All Roles' }],
	categoryOptions = [{ value: 'all', label: 'All Categories' }],
	showRole = true,
	showCategory = false,
}) => {
	// Event handlers
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

	const handleCategoryChange = (e: { target: { name: string; value: string | number } }): void => {
		if (setCategoryFilter) {
			setCategoryFilter(e.target.value as string);
		}
	};

	// Determine which filters to show
	const shouldShowRole = showRole && roleFilter !== undefined && setRoleFilter !== undefined;
	const shouldShowCategory = showCategory && categoryFilter !== undefined && setCategoryFilter !== undefined;

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
						placeholder={searchPlaceholder}
						value={searchTerm}
						onChange={handleSearchChange}
						icon={<MagnifyingGlassIcon className="w-5 h-5" />}
						className="w-full"
					/>
				</div>

				{/* Category Filter */}
				{shouldShowCategory && (
					<div className="min-w-[180px]">
						<SelectInput
							name="categoryFilter"
							value={categoryFilter}
							onChange={handleCategoryChange}
							options={categoryOptions}
							className="w-full"
						/>
					</div>
				)}

				{/* Role Filter */}
				{shouldShowRole && (
					<div className="min-w-[180px]">
						<SelectInput
							name="roleFilter"
							value={roleFilter}
							onChange={handleRoleChange}
							options={roleOptions}
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
						options={statusOptions}
						className="w-full"
					/>
				</div>
			</div>

			{/* Results Count */}
			<div className="mt-4 text-sm text-muted-foreground transition-all duration-200">
				Showing {filteredCount} of {totalCount} {itemType}
			</div>
		</div>
	);
});

UserSearchFilters.displayName = 'UserSearchFilters';

export default UserSearchFilters; 