import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
	StatsCard,
	AdminTable,
	AdminConfirmationModal,
	AdminPageHeader,
	AdminApplicationModal,
} from "../../components/admin";
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
	ClockIcon,
	CheckIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { OrganizerData, UserData } from "@/types";
import type { DataItem } from "../../components/common/SearchAndFilter";

// Simple modal state type
type OrganizerModalState = {
	isOpen: boolean;
	type: "status" | "flag" | "demote" | "approve" | "reject" | "details" | null;
	organizerId: string | null;
	organizerName: string;
	currentStatus: string;
	isFlagged: boolean;
	flagReason: string;
	rejectionReason?: string;
};

const OrganizersManagement: React.FC = () => {
	// State
	const [activeTab, setActiveTab] = useState(0); // 0 for approved organizers, 1 for applications
	const [organizers, setOrganizers] = useState<OrganizerData[]>([]);
	const [filteredOrganizers, setFilteredOrganizers] = useState<OrganizerData[]>([]);
	const [applications, setApplications] = useState<UserData[]>([]);
	const [filteredApplications, setFilteredApplications] = useState<UserData[]>([]);
	const [selectedApplication, setSelectedApplication] = useState<UserData | null>(null);
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
		rejectionReason: "",
	});

	// Filter options
	const statusOptions = [
		{ value: "all", label: "All Status" },
		{ value: "active", label: "Active" },
		{ value: "suspended", label: "Suspended" },
		{ value: "flagged", label: "Flagged" },
	];

	const applicationStatusOptions = [
		{ value: "all", label: "All Applications" },
		{ value: "pending", label: "Pending" },
		{ value: "rejected", label: "Rejected" },
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

	const applicationColumns = [
		{ key: "applicant", label: "Applicant" },
		{ key: "email", label: "Email" },
		{ key: "organization", label: "Organization" },
		{ key: "appliedDate", label: "Applied Date" },
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

	// Tab configuration
	const tabs = [
		{
			label: "Approved Organizers",
			count: organizers.length,
			icon: <UserGroupIcon className="w-4 h-4" />,
		},
		{
			label: "Applications",
			count: applications.filter((app) => app.organizerStatus === "pending").length,
			icon: <ClockIcon className="w-4 h-4" />,
		},
	];

	// Optimized stats calculation
	const organizerStats = useMemo(() => {
		const total = organizers.length;
		const active = organizers.filter((org) => org.status === "active" || !org.status).length;
		const suspended = organizers.filter((org) => org.status === "suspended").length;
		const flagged = organizers.filter((org) => org.isFlagged).length;
		const pending = applications.filter((app) => app.organizerStatus === "pending").length;

		return {
			total,
			active,
			suspended,
			flagged,
			pending,
		};
	}, [organizers, applications]);

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
			title: "Pending Applications",
			value: organizerStats.pending,
			description: "Awaiting approval",
			icon: <ClockIcon className="h-6 w-6 text-orange-500" />,
			bgClass: "bg-gradient-to-br from-orange-50 to-orange-100",
			borderClass: "border-orange-200",
			iconBgClass: "bg-orange-100",
		},
	];

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = (filtered: DataItem[]) => {
		if (activeTab === 0) {
			setFilteredOrganizers(filtered as OrganizerData[]);
		} else {
			setFilteredApplications(filtered as UserData[]);
		}
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

	const fetchApplications = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await axios.get("/admin/organizer-applications");
			if (data.success) {
				setApplications(data.applications);
				setFilteredApplications(data.applications);
			}
		} catch (error) {
			console.error("Error fetching applications:", error);
			setError("Failed to load organizer applications. Please try again later.");
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

	const approveApplication = useCallback(async () => {
		if (!modal.organizerId) return;

		try {
			const { data } = await axios.put(`/admin/organizer-applications/${modal.organizerId}/approve`);
			if (data.success) {
				// Update applications list
				setApplications((prev) =>
					prev.map((app) => (app._id === modal.organizerId ? { ...app, organizerStatus: "approved" } : app))
				);
				// Refresh organizers list to include the newly approved organizer
				fetchOrganizers();
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error approving application:", error);
			setError("Failed to approve organizer application. Please try again.");
		}
	}, [modal.organizerId, fetchOrganizers]);

	const rejectApplication = useCallback(async () => {
		if (!modal.organizerId) return;

		try {
			const { data } = await axios.put(`/admin/organizer-applications/${modal.organizerId}/reject`, {
				rejectionReason: modal.rejectionReason,
			});
			if (data.success) {
				// Update applications list
				setApplications((prev) =>
					prev.map((app) =>
						app._id === modal.organizerId
							? {
									...app,
									organizerStatus: "rejected",
									organizerApplication: {
										...app.organizerApplication,
										rejectionReason: modal.rejectionReason,
									},
							  }
							: app
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error rejecting application:", error);
			setError("Failed to reject organizer application. Please try again.");
		}
	}, [modal.organizerId, modal.rejectionReason]);

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
			rejectionReason: "",
		});
	}, []);

	const openApplicationModal = useCallback((type: "approve" | "reject", application: UserData) => {
		setModal({
			isOpen: true,
			type,
			organizerId: application._id,
			organizerName: application.name,
			currentStatus: application.status || "active",
			isFlagged: application.isFlagged || false,
			flagReason: application.flagReason || "",
			rejectionReason: "",
		});
	}, []);

	const openDetailsModal = useCallback((application: UserData) => {
		setSelectedApplication(application);
		setModal({
			isOpen: true,
			type: "details",
			organizerId: application._id,
			organizerName: application.name,
			currentStatus: application.status || "active",
			isFlagged: application.isFlagged || false,
			flagReason: application.flagReason || "",
			rejectionReason: "",
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({ ...prev, isOpen: false }));
		setSelectedApplication(null);
	}, []);

	const handleConfirm = useCallback(() => {
		if (modal.type === "status") {
			toggleOrganizerStatus();
		} else if (modal.type === "flag") {
			toggleOrganizerFlag();
		} else if (modal.type === "demote") {
			demoteOrganizer();
		} else if (modal.type === "approve") {
			approveApplication();
		} else if (modal.type === "reject") {
			rejectApplication();
		}
	}, [
		modal.type,
		toggleOrganizerStatus,
		toggleOrganizerFlag,
		demoteOrganizer,
		approveApplication,
		rejectApplication,
	]);

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

	// Render function for application rows
	const renderApplicationRow = useCallback(
		(application: UserData) => {
			const formatDate = (dateString: string | undefined): string => {
				if (!dateString) return "N/A";
				return new Date(dateString).toLocaleDateString();
			};

			const getStatusBadge = (status: string): React.ReactElement => {
				const statusClasses = {
					pending: "bg-yellow-100 text-yellow-800",
					approved: "bg-green-100 text-green-800",
					rejected: "bg-red-100 text-red-800",
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${
							statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800"
						}`}
					>
						{status === "pending" && <ClockIcon className="h-3 w-3 mr-1" />}
						{status === "approved" && <CheckIcon className="h-3 w-3 mr-1" />}
						{status === "rejected" && <XMarkIcon className="h-3 w-3 mr-1" />}
						{status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
					</span>
				);
			};

			return (
				<tr key={application._id} className="hover:bg-surface-secondary/50 transition-colors">
					{/* Applicant Info */}
					<td className="px-6 py-4">
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0">
								<div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-brand-light/20 rounded-full flex items-center justify-center">
									<UserIcon className="h-5 w-5 text-primary" />
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-card-foreground">{application.name}</div>
								<p className="text-xs text-muted-foreground">ID: {application._id.slice(-8)}</p>
							</div>
						</div>
					</td>

					{/* Email */}
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">{application.email}</div>
					</td>

					{/* Organization */}
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">
							{application.organizerApplication?.organizationName || "N/A"}
						</div>
					</td>

					{/* Applied Date */}
					<td className="px-6 py-4">
						<div className="text-sm text-card-foreground">
							{formatDate(application.organizerApplication?.appliedAt)}
						</div>
					</td>

					{/* Status */}
					<td className="px-6 py-4">{getStatusBadge(application.organizerStatus || "none")}</td>

					{/* Actions */}
					<td className="px-6 py-4">
						<div className="flex items-center space-x-2">
							{application.organizerStatus === "pending" && (
								<>
									<button
										onClick={() => openApplicationModal("approve", application)}
										className="inline-flex items-center px-3 py-1.5 text-xs bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition-all"
									>
										<CheckIcon className="h-3 w-3 mr-1" />
										Approve
									</button>
									<button
										onClick={() => openApplicationModal("reject", application)}
										className="inline-flex items-center px-3 py-1.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all"
									>
										<XMarkIcon className="h-3 w-3 mr-1" />
										Reject
									</button>
								</>
							)}
							<button
								onClick={() => openDetailsModal(application)}
								className="inline-flex items-center px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all"
							>
								View Details
							</button>
						</div>
					</td>
				</tr>
			);
		},
		[openApplicationModal, openDetailsModal]
	);

	// Load data on mount and tab change
	useEffect(() => {
		if (activeTab === 0) {
			fetchOrganizers();
		} else {
			fetchApplications();
		}
	}, [fetchOrganizers, fetchApplications, activeTab]);

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
					data={activeTab === 0 ? organizers : applications}
					onFilteredDataChange={handleFilteredDataChange}
					itemType={activeTab === 0 ? "organizers" : "applications"}
					searchPlaceholder={
						activeTab === 0
							? "Search organizers by name or email..."
							: "Search applications by name or email..."
					}
					statusOptions={activeTab === 0 ? statusOptions : applicationStatusOptions}
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

				{/* Tabs */}
				<div className="mb-8">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8">
							{tabs.map((tab, index) => (
								<button
									key={index}
									onClick={() => setActiveTab(index)}
									className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
										activeTab === index
											? "border-primary text-primary"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									{tab.icon}
									<span>{tab.label}</span>
									{tab.count > 0 && (
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												activeTab === index
													? "bg-primary/10 text-primary"
													: "bg-gray-100 text-gray-900"
											}`}
										>
											{tab.count}
										</span>
									)}
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Data Table */}
				<AdminTable
					loading={loading}
					filteredItems={activeTab === 0 ? filteredOrganizers : filteredApplications}
					searchTerm=""
					roleFilter={activeTab === 0 ? "organizer" : "all"}
					statusFilter="all"
					renderRow={activeTab === 0 ? renderOrganizerRow : renderApplicationRow}
					columns={activeTab === 0 ? columns : applicationColumns}
					emptyStateConfig={{
						...emptyStateConfig,
						title: activeTab === 0 ? "No organizers found" : "No applications found",
						noFiltersDescription:
							activeTab === 0
								? "No organizers have been registered yet"
								: "No organizer applications have been submitted yet",
					}}
				/>

				{/* Details Modal */}
				{modal.isOpen && modal.type === "details" && selectedApplication && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						{/* Backdrop with blur effect */}
						<div
							className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
							onClick={closeModal}
						/>

						{/* Modal content */}
						<div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-xl font-bold text-gray-900">Application Details</h3>
								<button
									onClick={closeModal}
									className="text-gray-400 hover:text-gray-600 transition-colors"
								>
									<XMarkIcon className="h-6 w-6" />
								</button>
							</div>

							<div className="space-y-6">
								{/* Applicant Information */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h4 className="text-lg font-semibold text-gray-900 mb-3">Applicant Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium text-gray-500">Name</label>
											<p className="text-gray-900">{selectedApplication.name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Email</label>
											<p className="text-gray-900">{selectedApplication.email}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500 mr-2">
												Current Status
											</label>
											<span
												className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${
													selectedApplication.organizerStatus === "pending"
														? "bg-yellow-100 text-yellow-800"
														: selectedApplication.organizerStatus === "approved"
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{selectedApplication.organizerStatus
													? selectedApplication.organizerStatus.charAt(0).toUpperCase() +
													  selectedApplication.organizerStatus.slice(1)
													: "Unknown"}
											</span>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Applied Date</label>
											<p className="text-gray-900">
												{selectedApplication.organizerApplication?.appliedAt
													? new Date(
															selectedApplication.organizerApplication.appliedAt
													  ).toLocaleDateString()
													: "N/A"}
											</p>
										</div>
									</div>
								</div>

								{/* Organization Details */}
								<div className="bg-blue-50 rounded-lg p-4">
									<h4 className="text-lg font-semibold text-gray-900 mb-3">Organization Details</h4>
									<div className="space-y-3">
										<div>
											<label className="text-sm font-medium text-gray-500">
												Organization Name
											</label>
											<p className="text-gray-900">
												{selectedApplication.organizerApplication?.organizationName ||
													"Not specified"}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Social Links</label>
											<p className="text-gray-900">
												{selectedApplication.organizerApplication?.socialLinks ||
													"Not provided"}
											</p>
										</div>
									</div>
								</div>

								{/* Application Details */}
								<div className="bg-green-50 rounded-lg p-4">
									<h4 className="text-lg font-semibold text-gray-900 mb-3">Application Details</h4>
									<div className="space-y-3">
										<div>
											<label className="text-sm font-medium text-gray-500">
												Reason for Application
											</label>
											<p className="text-gray-900 whitespace-pre-wrap">
												{selectedApplication.organizerApplication?.reason || "Not provided"}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Experience</label>
											<p className="text-gray-900 whitespace-pre-wrap">
												{selectedApplication.organizerApplication?.experience || "Not provided"}
											</p>
										</div>
									</div>
								</div>

								{/* Review Information (only if reviewed by admin) */}
								{selectedApplication.organizerApplication?.reviewedBy && (
									<div className="bg-purple-50 rounded-lg p-4">
										<h4 className="text-lg font-semibold text-gray-900 mb-3">Review Information</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-gray-500">Review by</label>
												<p className="text-gray-900">
													{typeof selectedApplication.organizerApplication.reviewedBy ===
													"string"
														? selectedApplication.organizerApplication.reviewedBy
														: (
																selectedApplication.organizerApplication.reviewedBy as {
																	email?: string;
																	name?: string;
																}
														  )?.email || "Unknown Admin"}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-500">
													Reviewed Date
												</label>
												<p className="text-gray-900">
													{selectedApplication.organizerApplication.reviewedAt &&
														new Date(
															selectedApplication.organizerApplication.reviewedAt
														).toLocaleDateString()}
												</p>
											</div>
											{selectedApplication.organizerApplication.rejectionReason && (
												<div className="md:col-span-2">
													<label className="text-sm font-medium text-gray-500">
														Rejection Reason
													</label>
													<p className="text-gray-900">
														{selectedApplication.organizerApplication.rejectionReason}
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							{selectedApplication.organizerStatus === "pending" && (
								<div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
									<button
										onClick={() => {
											closeModal();
											openApplicationModal("reject", selectedApplication);
										}}
										className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
									>
										Reject
									</button>
									<button
										onClick={() => {
											closeModal();
											openApplicationModal("approve", selectedApplication);
										}}
										className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
									>
										Approve
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Application Confirmation Modal */}
				<AdminApplicationModal
					isOpen={modal.isOpen && (modal.type === "approve" || modal.type === "reject")}
					onClose={closeModal}
					onConfirm={handleConfirm}
					type={modal.type as "approve" | "reject"}
					applicantName={modal.organizerName}
					rejectionReason={modal.rejectionReason}
					onRejectionReasonChange={(reason) => setModal((prev) => ({ ...prev, rejectionReason: reason }))}
				/>

				{/* Admin Confirmation Modal */}
				{modal.isOpen && (modal.type === "status" || modal.type === "flag" || modal.type === "demote") ? (
					<AdminConfirmationModal
						modalType={modal.type}
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
				) : null}
			</div>
		</div>
	);
};

export default OrganizersManagement;
