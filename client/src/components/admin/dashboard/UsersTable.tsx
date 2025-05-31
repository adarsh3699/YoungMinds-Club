import React, { memo } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { UsersTableProps, EmptyStateProps, TableHeaderProps, LoadingSpinnerProps } from '@/types';

const EmptyState: React.FC<EmptyStateProps> = memo(({ hasFilters }) => (
	<tr>
		<td colSpan={5} className="py-20 text-center">
			<div className="flex flex-col items-center gap-4 animate-fade-in">
				<UserGroupIcon className="w-16 h-16 text-muted-foreground/50" />
				<div>
					<h3 className="text-lg font-medium text-card-foreground">No users found</h3>
					<p className="text-muted-foreground">
						{hasFilters ? 'Try adjusting your search or filters' : 'No users have been registered yet'}
					</p>
				</div>
			</div>
		</td>
	</tr>
));

EmptyState.displayName = 'EmptyState';

const TableHeader: React.FC<TableHeaderProps> = memo(() => (
	<thead className="bg-gradient-to-r from-muted to-muted/50">
		<tr>
			<th className="py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border">
				User
			</th>
			<th className="py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border">
				Email
			</th>
			<th className="py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border">
				Role
			</th>
			<th className="py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border">
				Status
			</th>
			<th className="py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border">
				Actions
			</th>
		</tr>
	</thead>
));

TableHeader.displayName = 'TableHeader';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(() => (
	<div className="text-center py-20">
		<div className="inline-flex items-center gap-3 text-muted-foreground">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			<span className="text-lg">Loading users...</span>
		</div>
	</div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const UsersTable: React.FC<UsersTableProps> = ({
	loading,
	filteredUsers,
	searchTerm,
	roleFilter,
	statusFilter,
	renderUserRow,
	animationDelay = '0.35s',
}) => {
	const hasFilters = Boolean(searchTerm || (roleFilter && roleFilter !== 'all') || statusFilter !== 'all');
	const isEmpty = filteredUsers.length === 0 && !loading;

	return (
		<div
			className="bg-card rounded-2xl shadow-xl overflow-hidden animate-fade-in"
			style={{
				animationDelay,
				animationFillMode: 'both',
			}}
		>
			{loading ? (
				<LoadingSpinner />
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<TableHeader />
						<tbody className="divide-y divide-border">
							{filteredUsers.map((userData, index) => renderUserRow(userData, index))}
							{isEmpty && <EmptyState hasFilters={hasFilters} />}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default UsersTable; 