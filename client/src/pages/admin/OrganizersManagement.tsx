import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { StatsCard, AdminTable, AdminConfirmationModal, AdminPageHeader } from "../../components/admin/dashboard";
import { SearchAndFilter } from "../../components/common";
import {
	ExclamationTriangleIcon,
	UserGroupIcon,
	CalendarIcon,
	FlagIcon,
	ShieldCheckIcon,
	UserIcon,
	NoSymbolIcon,
	ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { OrganizerData } from "@/types";
import type { DataItem } from "../../components/common/SearchAndFilter";

// Simple modal state type
type OrganizerModalState = {
	isOpen: boolean;
	type: "status" | "flag" | "demote" | null;
	organizerId: string | null;
	organizerName: string;
	currentStatus: string;
	isFlagged: boolean;
	flagReason: string;
};

const OrganizersManagement: React.FC = () => {
	// State
	const [organizers, setOrganizers] = useState<OrganizerData[]>([]);
	const [filteredOrganizers, setFilteredOrganizers] = useState<OrganizerData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modal, setModal] = useState<OrganizerModalState>({
		isOpen: false,
		type: null,
		organizerId: null,
		organizerName: "",
		currentStatus: "",
		isFlagged: false,
		flagReason: "",
	});

	// Filter options
	const statusOptions = [
		{ value: "all", label: "All Status" },
		{ value: "active", label: "Active" },
		{ value: "suspended", label: "Suspended" },
		{ value: "flagged", label: "Flagged" },
	];

	// Table columns
	const columns = [
		{ key: "organizer", label: "Organizer" },
		{ key: "email", label: "Email" },
		{ key: "organization", label: "Organization" },
		{ key: "events", label: "Events" },
		{ key: "status", label: "Status" },
		{ key: "actions", label: "Actions" },
	];

	// Empty state config
	const emptyStateConfig = {
		icon: <UserGroupIcon className="w-16 h-16 text-muted-foreground/50" />,
		title: "No organizers found",
		description: "Try adjusting your search or filters",
		noFiltersDescription: "No organizers have been registered yet",
	};

	// Optimized stats calculation
	const organizerStats = useMemo(() => {
		const total = organizers.length;
		const active = organizers.filter((org) => org.status === "active" || !org.status).length;
		const suspended = organizers.filter((org) => org.status === "suspended").length;
		const flagged = organizers.filter((org) => org.isFlagged).length;
		const totalEvents = organizers.reduce((sum, org) => sum + (org.eventCount || 0), 0);

		return {
			total,
			active,
			suspended,
			flagged,
			totalEvents,
		};
	}, [organizers]);

	// Stats cards data
	const statsCards = [
		{
			title: "Total Organizers",
			value: organizerStats.total,
			description: "All registered organizers",
			icon: <UserGroupIcon className="h-6 w-6 text-primary" />,
			bgClass: "bg-gradient-primary-light",
			borderClass: "border-primary/20",
			iconBgClass: "bg-primary-5",
		},
		{
			title: "Active",
			value: organizerStats.active,
			description: "Currently active",
			icon: <ShieldCheckIcon className="h-6 w-6 text-success" />,
			bgClass: "bg-gradient-success-light",
			borderClass: "border-success/20",
			iconBgClass: "bg-success-5",
		},
		{
			title: "Suspended",
			value: organizerStats.suspended,
			description: "Temporarily suspended",
			icon: <NoSymbolIcon className="h-6 w-6 text-warning" />,
			bgClass: "bg-gradient-brand-tertiary-light",
			borderClass: "border-warning/20",
			iconBgClass: "bg-destructive-10",
		},
		{
			title: "Flagged",
			value: organizerStats.flagged,
			description: "Requiring attention",
			icon: <FlagIcon className="h-6 w-6 text-destructive" />,
			bgClass: "bg-gradient-brand-primary-light",
			borderClass: "border-destructive/20",
			iconBgClass: "bg-warning-10",
		},
		{
			title: "Total Events",
			value: organizerStats.totalEvents,
			description: "Events organized",
			icon: <CalendarIcon className="h-6 w-6 text-indigo" />,
			bgClass: "bg-gradient-indigo-light",
			borderClass: "border-indigo/20",
			iconBgClass: "bg-indigo-10",
		},
	];

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = (filtered: DataItem[]) => {
		setFilteredOrganizers(filtered as OrganizerData[]);
	};

	// API functions
	const fetchOrganizers = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await axios.get("/admin/organizers");
			if (data.success) {
				setOrganizers(data.organizers);
				setFilteredOrganizers(data.organizers);
			}
		} catch (error) {
			console.error("Error fetching organizers:", error);
			setError("Failed to load organizers. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, []);

	const toggleOrganizerStatus = useCallback(async () => {
		if (!modal.organizerId) return;

		try {
			const newStatus = modal.currentStatus === "active" ? "suspended" : "active";
			const { data } = await axios.put(`/admin/users/${modal.organizerId}/status`, {
				status: newStatus,
			});
			if (data.success) {
				setOrganizers((prev) =>
					prev.map((organizer) =>
						organizer._id === modal.organizerId ? { ...organizer, status: newStatus } : organizer
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error updating organizer status:", error);
			setError("Failed to update organizer status. Please try again.");
		}
	}, [modal.organizerId, modal.currentStatus]);

	const toggleOrganizerFlag = useCallback(async () => {
		if (!modal.organizerId) return;

		try {
			const { data } = await axios.put(`/admin/users/${modal.organizerId}/flag`, {
				isFlagged: !modal.isFlagged,
				flagReason: modal.flagReason,
			});
			if (data.success) {
				setOrganizers((prev) =>
					prev.map((organizer) =>
						organizer._id === modal.organizerId
							? {
									...organizer,
									isFlagged: !modal.isFlagged,
									flagReason: !modal.isFlagged ? modal.flagReason : null,
							  }
							: organizer
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error updating organizer flag status:", error);
			setError("Failed to update organizer flag status. Please try again.");
		}
	}, [modal.organizerId, modal.isFlagged, modal.flagReason]);

	const demoteOrganizer = useCallback(async () => {
		if (!modal.organizerId) return;

		try {
			const { data } = await axios.put(`/admin/users/${modal.organizerId}/role`, {
				role: "user",
			});
			if (data.success) {
				setOrganizers((prev) => prev.filter((org) => org._id !== modal.organizerId));
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error demoting organizer:", error);
			setError("Failed to demote organizer. Please try again.");
		}
	}, [modal.organizerId]);

	// Modal handlers
	const openModal = useCallback((type: "status" | "flag" | "demote", organizer: OrganizerData) => {
		setModal({
			isOpen: true,
			type,
			organizerId: organizer._id,
			organizerName: organizer.name,
			currentStatus: organizer.status || "active",
			isFlagged: organizer.isFlagged || false,
			flagReason: organizer.flagReason || "",
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const handleConfirm = useCallback(() => {
		if (modal.type === "status") {
			toggleOrganizerStatus();
		} else if (modal.type === "flag") {
			toggleOrganizerFlag();
		} else if (modal.type === "demote") {
			demoteOrganizer();
		}
	}, [modal.type, toggleOrganizerStatus, toggleOrganizerFlag, demoteOrganizer]);

	// Optimized render function
	const renderOrganizerRow = useCallback(
		(organizer: OrganizerData) => {
			const isActive = organizer.status === "active" || !organizer.status;
			const isSuspended = organizer.status === "suspended";

			return (
				<tr
					key={organizer._id}
					className={`hover:bg-surface-secondary/50 transition-colors ${
						organizer.isFlagged ? "bg-destructive/5" : ""
					}`}
				>
					{/* Organizer Info */}
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

					{/* Email */}
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">{organizer.email}</div>
					</td>

					{/* Organization */}
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">
							{organizer.organizationName || "Not specified"}
						</div>
					</td>

					{/* Events */}
					<td className="px-6 py-4">
						<span className="inline-flex items-center px-2.5 py-1 text-xs bg-indigo/10 text-indigo rounded-full">
							<CalendarIcon className="h-3 w-3 mr-1" />
							{organizer.eventCount || 0} events
						</span>
					</td>

					{/* Status */}
					<td className="px-6 py-4">
						<span
							className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${
								isActive ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
							}`}
						>
							{isActive ? (
								<ShieldCheckIcon className="h-3 w-3 mr-1" />
							) : (
								<NoSymbolIcon className="h-3 w-3 mr-1" />
							)}
							{organizer.status || "active"}
						</span>
					</td>

					{/* Actions */}
					<td className="px-6 py-4">
						<div className="flex items-center space-x-2">
							<button
								onClick={() => openModal("status", organizer)}
								className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all ${
									isSuspended
										? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
										: "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20"
								}`}
							>
								{isSuspended ? "Activate" : "Suspend"}
							</button>

							<button
								onClick={() => openModal("flag", organizer)}
								className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all ${
									organizer.isFlagged
										? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
										: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
								}`}
							>
								<FlagIcon className="h-3 w-3 mr-1" />
								{organizer.isFlagged ? "Unflag" : "Flag"}
							</button>

							<button
								onClick={() => openModal("demote", organizer)}
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
		[openModal]
	);

	// Load organizers on mount
	useEffect(() => {
		fetchOrganizers();
	}, [fetchOrganizers]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-background">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Header */}
				<AdminPageHeader
					icon={<UserGroupIcon className="w-8 h-8" />}
					title="Organizers Management"
					description="Manage event organizers, their status, and permissions"
					iconBgColor="text-success"
				/>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>

				{/* Search and Filters */}
				<SearchAndFilter
					data={organizers}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="organizers"
					searchPlaceholder="Search organizers by name or email..."
					statusOptions={statusOptions}
					showRole={false}
					showCategory={false}
					showAdvancedFilters={false}
				/>

				{/* Error Alert */}
				{error && (
					<div className="bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span className="flex-1">{error}</span>
						<button
							onClick={() => setError(null)}
							className="text-destructive hover:text-destructive/80 font-medium text-sm"
						>
							Dismiss
						</button>
					</div>
				)}

				{/* Organizers Table */}
				<AdminTable
					loading={loading}
					filteredItems={filteredOrganizers}
					searchTerm=""
					roleFilter="organizer"
					statusFilter="all"
					renderRow={renderOrganizerRow}
					columns={columns}
					emptyStateConfig={emptyStateConfig}
				/>

				{/* Admin Confirmation Modal */}
				<AdminConfirmationModal
					modalType={modal.type || "status"}
					isOpen={modal.isOpen}
					onClose={closeModal}
					userName={modal.organizerName}
					currentStatus={modal.currentStatus}
					isFlagged={modal.isFlagged}
					flagReason={modal.flagReason}
					onFlagReasonChange={(e) => setModal((prev) => ({ ...prev, flagReason: e.target.value }))}
					onConfirm={handleConfirm}
					context="user"
				/>
			</div>
		</div>
	);
};

export default OrganizersManagement;
