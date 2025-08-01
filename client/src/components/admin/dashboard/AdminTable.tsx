import React, { memo, useMemo } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { AdminTableProps, UsersTableProps } from "@/types";

/**
 * Simple EmptyState component
 */
const EmptyState: React.FC<{
	hasFilters: boolean;
	emptyStateConfig?: {
		icon: React.ReactNode;
		title: string;
		description: string;
		noFiltersDescription: string;
	};
	colSpan: number;
}> = memo(({ hasFilters, emptyStateConfig, colSpan }) => {
	const config = {
		icon: <UserGroupIcon className="w-16 h-16 text-muted-foreground/50" />,
		title: "No items found",
		description: "Try adjusting your search or filters",
		noFiltersDescription: "No items have been added yet",
		...emptyStateConfig,
	};

	return (
		<tr>
			<td colSpan={colSpan} className="py-20 text-center">
				<div className="flex flex-col items-center gap-4 animate-fade-in">
					{config.icon}
					<div className="text-center">
						<h3 className="text-lg font-medium text-card-foreground mb-1">{config.title}</h3>
						<p className="text-muted-foreground text-sm">
							{hasFilters ? config.description : config.noFiltersDescription}
						</p>
					</div>
				</div>
			</td>
		</tr>
	);
});

EmptyState.displayName = "EmptyState";

/**
 * Simple LoadingSpinner component
 */
const LoadingSpinner: React.FC<{ text?: string }> = memo(({ text = "Loading..." }) => (
	<div className="text-center py-20">
		<div className="inline-flex items-center gap-3 text-muted-foreground">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			<span className="text-lg">{text}</span>
		</div>
	</div>
));

LoadingSpinner.displayName = "LoadingSpinner";

/**
 * Simple and Dynamic AdminTable Component
 * Clean, optimized, and easy to understand
 */
const AdminTable: React.FC<AdminTableProps> = memo(
	({
		loading,
		filteredItems,
		searchTerm,
		roleFilter,
		statusFilter,
		renderRow,
		columns,
		emptyStateConfig,
		className = "",
		"aria-label": ariaLabel = "Data table",
	}) => {
		// Simple optimized calculations
		const hasFilters = useMemo(
			() => Boolean(searchTerm || (roleFilter && roleFilter !== "all") || statusFilter !== "all"),
			[searchTerm, roleFilter, statusFilter]
		);

		const isEmpty = !loading && filteredItems.length === 0;

		// Render loading state
		if (loading) {
			return (
				<div className={`bg-card rounded-2xl shadow-xl ${className}`.trim()}>
					<LoadingSpinner text="Loading data..." />
				</div>
			);
		}

		return (
			<div
				className={`bg-card rounded-2xl shadow-xl overflow-hidden animate-fade-in ${className}`.trim()}
				role="region"
				aria-label="Data table container"
			>
				<div className="overflow-x-auto">
					<table className="min-w-full" role="table" aria-label={ariaLabel}>
						{/* Table Header */}
						<thead className="bg-gradient-to-r from-muted to-muted/50">
							<tr role="row">
								{columns.map((column) => (
									<th
										key={column.key}
										className={`py-4 px-6 text-left text-sm font-semibold text-card-foreground border-b border-border ${
											column.className || ""
										}`}
										scope="col"
									>
										{column.label}
									</th>
								))}
							</tr>
						</thead>

						{/* Table Body */}
						<tbody className="divide-y divide-border" role="rowgroup">
							{isEmpty ? (
								<EmptyState
									hasFilters={hasFilters}
									emptyStateConfig={emptyStateConfig}
									colSpan={columns.length}
								/>
							) : (
								filteredItems.map((item, index) => (
									<React.Fragment key={item._id || item.id || index}>
										{renderRow(item, index)}
									</React.Fragment>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
);

AdminTable.displayName = "AdminTable";

/**
 * Backward compatibility wrapper for UsersTable
 */
const UsersTable: React.FC<UsersTableProps> = memo(
	({ loading, filteredUsers, searchTerm, roleFilter, statusFilter, renderUserRow }) => {
		const columns = [
			{ key: "user", label: "User" },
			{ key: "email", label: "Email" },
			{ key: "role", label: "Role" },
			{ key: "status", label: "Status" },
			{ key: "actions", label: "Actions" },
		];

		const emptyStateConfig = {
			icon: <UserGroupIcon className="w-16 h-16 text-muted-foreground/50" />,
			title: "No users found",
			description: "Try adjusting your search or filters",
			noFiltersDescription: "No users have been registered yet",
		};

		return (
			<AdminTable
				loading={loading}
				filteredItems={filteredUsers}
				searchTerm={searchTerm}
				roleFilter={roleFilter}
				statusFilter={statusFilter}
				renderRow={renderUserRow}
				columns={columns}
				emptyStateConfig={emptyStateConfig}
				aria-label="Users table"
			/>
		);
	}
);

UsersTable.displayName = "UsersTable";

export default AdminTable;
export { UsersTable };
