import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { AdminPageHeader, AdminTable, AdminConfirmationModal, StatsCard } from "../../components/admin";
import { SearchAndFilter } from "../../components/common";
import {
	ExclamationTriangleIcon,
	BriefcaseIcon,
	FlagIcon,
	TrashIcon,
	EyeIcon,
	DocumentCheckIcon,
	SparklesIcon,
	PencilIcon,
	MapPinIcon,
	CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { AdminInternshipData } from "@/types";
import type { DataItem } from "../../components/common/SearchAndFilter";
import CreateInternshipModal from "../../components/organizer/CreateInternshipModal";
import { INTERNSHIP_CATEGORIES } from "../../utils/internshipConstants";

// Enhanced modal state type to include edit
type InternshipModalState = {
	isOpen: boolean;
	type: "delete" | "flag" | "edit" | null;
	internshipId: string | null;
	internshipTitle: string;
	isFlagged: boolean;
	flagReason: string;
	internshipData?: AdminInternshipData | null;
	isLoading: boolean;
};

const InternshipManagement: React.FC = () => {
	// State
	const [internships, setInternships] = useState<AdminInternshipData[]>([]);
	const [filteredInternships, setFilteredInternships] = useState<AdminInternshipData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modal, setModal] = useState<InternshipModalState>({
		isOpen: false,
		type: null,
		internshipId: null,
		internshipTitle: "",
		isFlagged: false,
		flagReason: "",
		internshipData: null,
		isLoading: false,
	});

	// Filter options
	const statusOptions = [
		{ value: "", label: "All Status" },
		{ value: "published", label: "Published" },
		{ value: "draft", label: "Draft" },
		{ value: "closed", label: "Closed" },
		{ value: "completed", label: "Completed" },
		{ value: "flagged", label: "Flagged" },
	];

	// Table columns
	const columns = [
		{ key: "internship", label: "Internship", className: "w-1/4 min-w-[280px]" },
		{ key: "deadline", label: "Application Deadline", className: "w-1/8 min-w-[140px]" },
		{ key: "organizer", label: "Organizer", className: "w-1/8 min-w-[120px]" },
		{ key: "category", label: "Category", className: "w-1/12 min-w-[100px]" },
		{ key: "compensation", label: "Compensation", className: "w-1/12 min-w-[100px]" },
		{ key: "location", label: "Location", className: "w-1/12 min-w-[100px]" },
		{ key: "status", label: "Status", className: "w-1/12 min-w-[100px]" },
		{ key: "actions", label: "Actions", className: "w-1/6 min-w-[160px]" },
	];

	// Empty state config
	const emptyStateConfig = {
		icon: <BriefcaseIcon className="w-16 h-16 text-muted-foreground/50" />,
		title: "No internships found",
		description: "Try adjusting your search or filters",
		noFiltersDescription: "No internships have been created yet",
	};

	// Optimized stats calculation
	const stats = useMemo(() => {
		const total = internships.length;
		const published = internships.filter((i) => i.isPublished).length;
		const featured = internships.filter((i) => i.isFeatured).length;
		const flagged = internships.filter((i) => i.isFlagged).length;
		const closed = internships.filter((i) => i.status === "closed").length;
		const totalApplications = internships.reduce((sum, i) => sum + (i.applicationCount || 0), 0);

		return {
			total,
			published,
			draft: total - published,
			featured,
			flagged,
			closed,
			totalApplications,
		};
	}, [internships]);

	// Stats cards data
	const statsCards = [
		{
			title: "Total Internships",
			value: stats.total,
			description: "All registered internships",
			icon: <BriefcaseIcon className="h-6 w-6 text-primary" />,
			bgClass: "bg-gradient-primary-light",
			borderClass: "border-primary-20",
			iconBgClass: "bg-primary-5",
		},
		{
			title: "Published",
			value: stats.published,
			description: "Live & visible internships",
			icon: <EyeIcon className="h-6 w-6 text-success" />,
			bgClass: "bg-gradient-success-light",
			borderClass: "border-success-20",
			iconBgClass: "bg-success-5",
		},
		{
			title: "Draft",
			value: stats.draft,
			description: "Unpublished internships",
			icon: <DocumentCheckIcon className="h-6 w-6 text-warning" />,
			bgClass: "bg-warning-10",
			borderClass: "border-warning-20",
			iconBgClass: "bg-warning-5",
		},
		{
			title: "Applications",
			value: stats.totalApplications,
			description: "Total applications received",
			icon: <DocumentCheckIcon className="h-6 w-6 text-blue-500" />,
			bgClass: "bg-blue-10",
			borderClass: "border-blue-20",
			iconBgClass: "bg-blue-5",
		},
		{
			title: "Flagged",
			value: stats.flagged,
			description: "Requiring attention",
			icon: <FlagIcon className="h-6 w-6 text-destructive" />,
			bgClass: "bg-destructive-10",
			borderClass: "border-destructive-20",
			iconBgClass: "bg-destructive-10",
		},
	];

	// Transform AdminInternshipData to DataItem format for SearchAndFilter
	const transformedInternships = useMemo(() => {
		return internships.map((internship) => ({
			...internship,
			location: {
				...internship.location,
				type: (internship.location?.type === "remote" ? "online" : "offline") as "online" | "offline",
			},
		}));
	}, [internships]);

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = useCallback(
		(filtered: DataItem[]) => {
			// Map back to original internships using _id
			const filteredIds = filtered.map((item) => item._id);
			const originalFiltered = internships.filter((internship) => filteredIds.includes(internship._id));
			setFilteredInternships(originalFiltered);
		},
		[internships]
	);

	// API functions
	const fetchInternships = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await axios.get("/admin/internships");
			if (data.success) {
				setInternships(data.internships);
				// Initialize filteredInternships to show all data initially
				setFilteredInternships(data.internships);
			}
		} catch (error) {
			console.error("Error fetching internships:", error);
			setError("Failed to load internships. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteInternship = useCallback(async () => {
		if (!modal.internshipId) return;

		// Set loading state
		setModal((prev) => ({ ...prev, isLoading: true }));

		try {
			const { data } = await axios.delete(`/admin/internships/${modal.internshipId}`);
			if (data.success) {
				setInternships((prev) => prev.filter((internship) => internship._id !== modal.internshipId));
				setModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
			}
		} catch (error) {
			console.error("Error deleting internship:", error);
			setError("Failed to delete internship. Please try again.");
			// Reset loading state on error
			setModal((prev) => ({ ...prev, isLoading: false }));
		}
	}, [modal.internshipId]);

	const toggleFlag = useCallback(async () => {
		if (!modal.internshipId) return;

		try {
			const { data } = await axios.put(`/admin/internships/${modal.internshipId}/flag`, {
				isFlagged: !modal.isFlagged,
				flagReason: modal.flagReason,
			});

			if (data.success) {
				setInternships((prev) =>
					prev.map((internship) =>
						internship._id === modal.internshipId
							? {
									...internship,
									isFlagged: !modal.isFlagged,
									flagReason: !modal.isFlagged ? modal.flagReason : null,
							  }
							: internship
					)
				);
				setModal((prev) => ({ ...prev, isOpen: false }));
			}
		} catch (error) {
			console.error("Error updating internship flag status:", error);
			setError("Failed to update internship flag status. Please try again.");
		}
	}, [modal.internshipId, modal.isFlagged, modal.flagReason]);

	const toggleFeature = useCallback(
		async (internshipId: string, currentFeaturedStatus: boolean) => {
			// Find the internship to check if it's published
			const internship = internships.find((i) => i._id === internshipId);
			if (!internship?.isPublished && !currentFeaturedStatus) {
				setError("Only published internships can be featured. Please publish the internship first.");
				return;
			}

			try {
				const { data } = await axios.put(`/admin/internships/${internshipId}/feature`, {
					isFeatured: !currentFeaturedStatus,
				});

				if (data.success) {
					setInternships((prev) =>
						prev.map((internship) =>
							internship._id === internshipId
								? { ...internship, isFeatured: !currentFeaturedStatus }
								: internship
						)
					);
					// Clear any previous error messages on successful operation
					setError(null);
				}
			} catch (error) {
				console.error("Error updating internship featured status:", error);
				setError("Failed to update internship featured status. Please try again.");
			}
		},
		[internships]
	);

	// Modal handlers
	const openModal = useCallback((type: "delete" | "flag" | "edit", internship: AdminInternshipData) => {
		setModal({
			isOpen: true,
			type,
			internshipId: internship._id,
			internshipTitle: internship.title,
			isFlagged: internship.isFlagged || false,
			flagReason: internship.flagReason || "",
			internshipData: type === "edit" ? internship : null,
			isLoading: false,
		});
	}, []);

	const closeModal = useCallback(() => {
		setModal((prev) => ({
			...prev,
			isOpen: false,
			type: null,
			internshipData: null,
			isLoading: false,
		}));
	}, []);

	const handleConfirm = useCallback(() => {
		if (modal.type === "delete") {
			deleteInternship();
		} else if (modal.type === "flag") {
			toggleFlag();
		}
		// Edit is handled by the CreateInternshipModal's onSuccess callback
	}, [modal.type, deleteInternship, toggleFlag]);

	const handleEditSuccess = useCallback(
		(updatedInternship: AdminInternshipData) => {
			// Update the internship in the local state
			setInternships((prev) =>
				prev.map((internship) =>
					internship._id === updatedInternship._id ? { ...internship, ...updatedInternship } : internship
				)
			);
			closeModal();
		},
		[closeModal]
	);

	// Optimized render function
	const renderInternshipRow = useCallback(
		(internship: AdminInternshipData) => (
			<tr
				key={internship._id}
				className={`group hover:bg-card-hover transition-colors ${
					internship.isFlagged ? "bg-destructive-5 border-l-4 border-l-destructive" : ""
				}`}
			>
				{/* Internship Details */}
				<td className="py-4 px-6">
					<div className="flex items-start space-x-3">
						<div className="relative flex-shrink-0">
							<img
								src={
									internship.organizer?.organizerBrandLogo ||
									internship.logo ||
									internship.poster ||
									"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCA1MEg3MFY2MEgzMFY1MFoiIGZpbGw9IiM2QjcyODAiLz4KPHA+YXRoIGQ9Ik0zNSA0MEg2NVY0N0gzNVY0MFoiIGZpbGw9IiM2QjcyODAiLz4KPHA+YXRoIGQ9Ik0zNSA2NUg1NVY3MEgzNVY2NVoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+"
								}
								alt={internship.title}
								className="w-12 h-12 object-cover rounded-lg shadow-md"
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCA1MEg3MFY2MEgzMFY1MFoiIGZpbGw9IiM2QjcyODAiLz4KPHA+YXRoIGQ9Ik0zNSA0MEg2NVY0N0gzNVY0MFoiIGZpbGw9IiM2QjcyODAiLz4KPHA+YXRoIGQ9Ik0zNSA2NUg1NVY3MEgzNVY2NVoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+";
								}}
							/>
							{internship.isFeatured && (
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full border-2 border-card" />
							)}
						</div>
						<div className="min-w-0 flex-1">
							<Link
								to={`/internship/${internship._id}`}
								className="text-brand-primary hover:text-brand-dark font-semibold text-sm block mb-1 transition-colors leading-tight"
								title={internship.title}
							>
								<div className="line-clamp-2 break-words">{internship.title}</div>
							</Link>
							<p className="text-xs text-muted-foreground">
								{internship.capacity} position{internship.capacity > 1 ? "s" : ""} •{" "}
								{internship.applicationCount || 0} applications
							</p>
							{internship.isFlagged && (
								<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-destructive-10 text-destructive rounded-full border border-destructive-20 mt-1">
									<FlagIcon className="w-3 h-3 mr-1" />
									Flagged
								</span>
							)}
						</div>
					</div>
				</td>

				{/* Application Deadline */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="font-medium">{format(new Date(internship.applicationDeadline), "PPP")}</div>
					<div className="text-xs text-muted-foreground mt-1">
						{new Date(internship.applicationDeadline) < new Date() ? (
							<span className="text-destructive">Deadline passed</span>
						) : (
							<span className="text-success">Open for applications</span>
						)}
					</div>
				</td>

				{/* Organizer */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="font-medium">
						{internship.organizer?.name || internship.organizerId?.name || "Unknown"}
					</div>
					{internship.organizerId?.organizationName && (
						<div className="text-xs text-muted-foreground mt-1">
							{internship.organizerId.organizationName}
						</div>
					)}
				</td>

				{/* Category */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-50 text-accent-foreground border border-accent-30">
						{internship.category}
					</span>
				</td>

				{/* Compensation */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="flex items-center space-x-1">
						<CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
						<span
							className={`font-medium ${
								internship.compensation.type === "Paid" ? "text-success" : "text-muted-foreground"
							}`}
						>
							{internship.compensation.type === "Paid" ? `₹${internship.compensation.amount}` : "Unpaid"}
						</span>
					</div>
				</td>

				{/* Location */}
				<td className="py-4 px-6 text-sm text-card-foreground">
					<div className="flex items-center space-x-1">
						<MapPinIcon className="w-4 h-4 text-muted-foreground" />
						<span className="capitalize font-medium">{internship.location.type}</span>
					</div>
					{internship.location.type !== "remote" && internship.location.city && (
						<div className="text-xs text-muted-foreground mt-1">{internship.location.city}</div>
					)}
				</td>

				{/* Status */}
				<td className="py-4 px-6">
					<div className="flex flex-col space-y-2">
						<span
							className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
								internship.isPublished
									? "bg-success-10 text-success border border-success-20"
									: "bg-warning-10 text-warning border border-warning-20"
							}`}
						>
							{internship.isPublished ? "Published" : "Draft"}
						</span>
						{internship.isFeatured && (
							<span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-purple-10 text-purple rounded-full border border-purple-20">
								Featured
							</span>
						)}
					</div>
				</td>

				{/* Actions */}
				<td className="py-4 px-6">
					<div className="flex flex-wrap gap-1.5">
						<button
							onClick={() => openModal("edit", internship)}
							className="px-2.5 py-1.5 text-xs font-medium bg-primary-10 text-primary rounded-lg hover:bg-primary-20 transition-all border border-primary-20"
						>
							<PencilIcon className="w-3 h-3 mr-1 inline" />
							Edit
						</button>

						<button
							onClick={() =>
								internship.isPublished && toggleFeature(internship._id, internship.isFeatured || false)
							}
							disabled={!internship.isPublished}
							title={
								!internship.isPublished
									? "Only published internships can be featured"
									: internship.isFeatured
									? "Remove from featured internships"
									: "Add to featured internships"
							}
							className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
								!internship.isPublished
									? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
									: internship.isFeatured
									? "bg-purple text-white hover:bg-purple-10"
									: "bg-purple-10 text-purple hover:bg-purple-30 border border-purple"
							}`}
						>
							<SparklesIcon className="w-3 h-3 mr-1 inline" />
							{internship.isFeatured ? "Unfeature" : "Feature"}
						</button>

						<button
							onClick={() => openModal("flag", internship)}
							className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
								internship.isFlagged
									? "bg-info text-white hover:bg-info-80"
									: "bg-warning text-white hover:bg-warning-80"
							}`}
						>
							<FlagIcon className="w-3 h-3 mr-1 inline" />
							{internship.isFlagged ? "Unflag" : "Flag"}
						</button>

						<button
							onClick={() => openModal("delete", internship)}
							className="px-2.5 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive-80 transition-all"
						>
							<TrashIcon className="w-3 h-3 mr-1 inline" />
							Delete
						</button>

						<Link
							to={`/internship/${internship._id}`}
							className="px-2.5 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-card-hover transition-all"
						>
							<EyeIcon className="w-3 h-3 mr-1 inline" />
							View
						</Link>
					</div>
				</td>
			</tr>
		),
		[openModal, toggleFeature]
	);

	// Load internships on mount
	useEffect(() => {
		fetchInternships();
	}, [fetchInternships]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-surface-secondary to-surface-primary">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Header */}
				<AdminPageHeader
					icon={<BriefcaseIcon className="w-8 h-8" />}
					title="Internship Management"
					description="Manage and monitor all internships in the system"
					iconBgColor="text-brand-primary"
				/>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>

				{/* Enhanced Search and Filters */}
				<SearchAndFilter
					data={transformedInternships}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="internships"
					searchPlaceholder="Search internships by title, company, or skills..."
					showCategory={true}
					showAdvancedFilters={true}
					categoryOptions={INTERNSHIP_CATEGORIES}
					statusOptions={statusOptions}
					enableDateRange={true}
					enableOrganizer={true}
					enableFeaturedOnly={true}
				/>

				{/* Error Alert */}
				{error && (
					<div className="bg-destructive-10 border-2 border-destructive-20 text-destructive px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
						<ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Internships Table */}
				<AdminTable
					loading={loading}
					filteredItems={filteredInternships}
					searchTerm=""
					roleFilter="internship"
					statusFilter="all"
					renderRow={renderInternshipRow}
					columns={columns}
					emptyStateConfig={emptyStateConfig}
				/>

				{/* Admin Confirmation Modal */}
				<AdminConfirmationModal
					modalType={modal.type === "edit" ? "delete" : modal.type || "delete"}
					isOpen={modal.isOpen && modal.type !== "edit"}
					onClose={closeModal}
					userName={modal.internshipTitle}
					isFlagged={modal.isFlagged}
					flagReason={modal.flagReason}
					onFlagReasonChange={(e) => setModal((prev) => ({ ...prev, flagReason: e.target.value }))}
					onConfirm={handleConfirm}
					context="internship"
					isLoading={modal.isLoading}
				/>

				{/* Edit Internship Modal */}
				{modal.isOpen && modal.type === "edit" && modal.internshipData && (
					<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black-40">
						<div className="ym-bg-card w-full h-full sm:rounded-xl sm:shadow-xl sm:w-full sm:max-w-5xl sm:mx-auto sm:h-auto overflow-hidden">
							<CreateInternshipModal
								onClose={closeModal}
								onSuccess={handleEditSuccess}
								internshipToEdit={modal.internshipData as any} // eslint-disable-line @typescript-eslint/no-explicit-any
								isEditing={true}
								apiEndpoint={
									modal.internshipData?._id
										? `/admin/internships/${modal.internshipData._id}`
										: (null as any) // eslint-disable-line @typescript-eslint/no-explicit-any
								}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default InternshipManagement;
