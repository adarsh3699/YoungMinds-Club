import React, { memo, useState, useEffect, useMemo } from "react";
import {
	MagnifyingGlassIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	AdjustmentsHorizontalIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import { FormInput, SelectInput, Switch, DateTimePicker } from ".";
import { SelectOption } from "@/types";

// Generic data item interface
interface DataItem {
	id?: string;
	_id?: string;
	title?: string;
	name?: string;
	category?: string;
	type?: string;
	tags?: string[];
	date?: string;
	endDate?: string;
	createdAt?: string;
	registrationCount?: number;
	price?: number;
	capacity?: number;
	organizer?: {
		name?: string;
	};
	location?: {
		city?: string;
		venue?: string;
		type?: "online" | "offline";
	};
	[key: string]: any; // Allow additional properties
}

// Configuration interface for the component
interface SearchAndFilterConfig {
	// Data and filtering
	data: DataItem[];
	onFilteredDataChange: (filteredData: DataItem[]) => void;

	// UI Configuration
	itemType?: string;
	searchPlaceholder?: string;
	animationDelay?: string;
	disableAnimations?: boolean;

	// Filter options
	categoryOptions?: SelectOption[];
	statusOptions?: SelectOption[];
	roleOptions?: SelectOption[];
	eventTypeOptions?: SelectOption[];

	// Show/hide filters
	showCategory?: boolean;
	showRole?: boolean;
	showAdvancedFilters?: boolean;

	// Advanced filter options
	enableDateRange?: boolean;
	enableEventType?: boolean;
	enableOrganizer?: boolean;
	enableRegistrationRange?: boolean;
	enablePriceRange?: boolean;
	enableOnlineOnly?: boolean;
	enableFeaturedOnly?: boolean;
	enableFreeOnly?: boolean;
}

/**
 * Independent SearchAndFilter component that manages its own state and filtering logic
 */
const SearchAndFilter: React.FC<SearchAndFilterConfig> = memo(
	({
		data,
		onFilteredDataChange,
		itemType = "items",
		searchPlaceholder = "Search...",
		animationDelay = "0.3s",
		disableAnimations = false,
		categoryOptions = [{ label: "All Categories", value: "" }],
		statusOptions = [{ label: "All Status", value: "" }],
		roleOptions = [{ label: "All Roles", value: "" }],
		eventTypeOptions = [{ label: "All Types", value: "" }],
		showCategory = false,
		showRole = false,
		showAdvancedFilters = false,
		enableDateRange = false,
		enableEventType = false,
		enableOrganizer = false,
		enableRegistrationRange = false,
		enablePriceRange = false,
		enableOnlineOnly = false,
		enableFeaturedOnly = false,
		enableFreeOnly = false,
	}) => {
		// Basic filter states
		const [searchTerm, setSearchTerm] = useState<string>("");
		const [categoryFilter, setCategoryFilter] = useState<string>("");
		const [statusFilter, setStatusFilter] = useState<string>("");
		const [roleFilter, setRoleFilter] = useState<string>("");

		// Advanced filter states
		const [showAdvancedFiltersPanel, setShowAdvancedFiltersPanel] = useState(false);
		const [startDate, setStartDate] = useState<string>("");
		const [endDate, setEndDate] = useState<string>("");
		const [eventType, setEventType] = useState<string>("");
		const [organizer, setOrganizer] = useState<string>("");
		const [minRegistrations, setMinRegistrations] = useState<string>("");
		const [maxRegistrations, setMaxRegistrations] = useState<string>("");
		const [minPrice, setMinPrice] = useState<string>("");
		const [maxPrice, setMaxPrice] = useState<string>("");
		const [isOnlineOnly, setIsOnlineOnly] = useState<boolean>(false);
		const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(false);
		const [isFreeOnly, setIsFreeOnly] = useState<boolean>(false);

		// Filtering logic
		const filteredData = useMemo(() => {
			if (!data || data.length === 0) return [];

			let result = [...data];

			// Apply search filter
			if (searchTerm.trim()) {
				const query = searchTerm.toLowerCase().trim();
				result = result.filter((item) => {
					// Search in title/name
					const titleMatch = (item.title || item.name || "").toLowerCase().includes(query);

					// Search in email (for organizers)
					const emailMatch = item.email && item.email.toLowerCase().includes(query);

					// Search in organization name (for organizers)
					const organizationMatch =
						item.organizationName && item.organizationName.toLowerCase().includes(query);

					// Search in location fields (for events)
					const locationMatch =
						item.location &&
						((item.location.city && item.location.city.toLowerCase().includes(query)) ||
							(item.location.venue && item.location.venue.toLowerCase().includes(query)) ||
							(item.location.type === "online" && "online".includes(query)) ||
							(item.location.type === "remote" && "remote".includes(query)));

					// Search in tags (for events)
					const tagsMatch = item.tags && item.tags.some((tag) => tag.toLowerCase().includes(query));

					return titleMatch || emailMatch || organizationMatch || locationMatch || tagsMatch;
				});
			}

			// Apply category filter
			if (categoryFilter && categoryFilter !== "") {
				result = result.filter((item) => item.category === categoryFilter);
			}

			// Apply role filter
			if (roleFilter && roleFilter !== "" && roleFilter !== "all") {
				result = result.filter((item) => item.role === roleFilter);
			}

			// Apply event type filter
			if (eventType && eventType !== "") {
				result = result.filter((item) => item.type === eventType);
			}

			// Apply online only filter
			if (isOnlineOnly) {
				result = result.filter((item) => item.location?.type === "online");
			}

			// Apply free only filter
			if (isFreeOnly) {
				result = result.filter((item) => (item.price || 0) === 0);
			}

			// Apply date range filter
			if (startDate) {
				const startDateObj = new Date(startDate);
				result = result.filter((item) => item.date && new Date(item.date) >= startDateObj);
			}
			if (endDate) {
				const endDateObj = new Date(endDate);
				result = result.filter((item) => item.date && new Date(item.date) <= endDateObj);
			}

			// Apply organizer filter
			if (organizer.trim()) {
				const organizerQuery = organizer.toLowerCase();
				result = result.filter(
					(item) => item.organizer?.name && item.organizer.name.toLowerCase().includes(organizerQuery)
				);
			}

			// Apply registration range filter
			if (minRegistrations) {
				const minReg = parseInt(minRegistrations);
				result = result.filter((item) => (item.registrationCount || 0) >= minReg);
			}
			if (maxRegistrations) {
				const maxReg = parseInt(maxRegistrations);
				result = result.filter((item) => (item.registrationCount || 0) <= maxReg);
			}

			// Apply price range filter
			if (minPrice) {
				const minPriceNum = parseFloat(minPrice);
				result = result.filter((item) => (item.price || 0) >= minPriceNum);
			}
			if (maxPrice) {
				const maxPriceNum = parseFloat(maxPrice);
				result = result.filter((item) => (item.price || 0) <= maxPriceNum);
			}

			// Apply status-based sorting/filtering
			if (statusFilter && statusFilter !== "" && statusFilter !== "all") {
				const now = new Date();
				switch (statusFilter) {
					// Event-specific statuses
					case "popular":
						result.sort((a, b) => (b.registrationCount || 0) - (a.registrationCount || 0));
						break;
					case "upcoming":
						result.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
						break;
					case "ongoing":
						result = result.filter((item) => {
							if (!item.date) return false;
							const eventDate = new Date(item.date);
							const endDate = new Date(item.endDate || item.date);
							return eventDate <= now && now <= endDate;
						});
						break;
					case "completed":
						result = result.filter((item) => {
							if (!item.date) return false;
							const endDate = new Date(item.endDate || item.date);
							return endDate < now;
						});
						break;
					// Organizer-specific statuses
					case "active":
						result = result.filter((item) => item.status === "active" || !item.status);
						break;
					case "suspended":
						result = result.filter((item) => item.status === "suspended");
						break;
					case "flagged":
						result = result.filter((item) => item.isFlagged);
						break;
				}
			}

			return result;
		}, [
			data,
			searchTerm,
			categoryFilter,
			statusFilter,
			roleFilter,
			startDate,
			endDate,
			eventType,
			organizer,
			minRegistrations,
			maxRegistrations,
			minPrice,
			maxPrice,
			isOnlineOnly,
			isFreeOnly,
		]);

		// Notify parent of filtered data changes
		useEffect(() => {
			onFilteredDataChange(filteredData);
		}, [filteredData, onFilteredDataChange]);

		// Reset all filters
		const resetAllFilters = () => {
			setSearchTerm("");
			setCategoryFilter("");
			setStatusFilter("");
			setRoleFilter("");
			setStartDate("");
			setEndDate("");
			setEventType("");
			setOrganizer("");
			setMinRegistrations("");
			setMaxRegistrations("");
			setMinPrice("");
			setMaxPrice("");
			setIsOnlineOnly(false);
			setIsFeaturedOnly(false);
			setIsFreeOnly(false);
		};

		// Check if any advanced filters are active
		const hasActiveAdvancedFilters =
			startDate ||
			endDate ||
			eventType ||
			organizer ||
			minRegistrations ||
			maxRegistrations ||
			minPrice ||
			maxPrice ||
			isOnlineOnly ||
			isFeaturedOnly ||
			isFreeOnly;

		return (
			<div
				className={`glass-effect rounded-3xl shadow-xl mb-8 relative z-20 border border-border/20 backdrop-blur-lg ${
					!disableAnimations ? "animate-fade-in" : ""
				}`}
				style={
					!disableAnimations
						? {
								animationDelay,
								animationFillMode: "both",
						  }
						: {}
				}
			>
				{/* Basic Filters Section */}
				<div className="px-8 pt-8 pb-4 rounded-t-xl bg-gradient-to-br from-card/95 via-card/90 to-muted/30">
					<div className="flex flex-col lg:flex-row gap-6">
						{/* Search Input */}
						<div className="flex-1">
							<FormInput
								type="text"
								name="search"
								placeholder={searchPlaceholder}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								icon={<MagnifyingGlassIcon className="w-5 h-5" />}
								className="w-full"
							/>
						</div>

						{/* Category Filter */}
						{showCategory && (
							<div className="min-w-[200px]">
								<SelectInput
									name="categoryFilter"
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value.toString())}
									options={categoryOptions}
									className="w-full"
								/>
							</div>
						)}

						{/* Role Filter */}
						{showRole && (
							<div className="min-w-[200px]">
								<SelectInput
									name="roleFilter"
									value={roleFilter}
									onChange={(e) => setRoleFilter(e.target.value.toString())}
									options={roleOptions}
									className="w-full"
								/>
							</div>
						)}

						{/* Status Filter */}
						<div className="min-w-[200px]">
							<SelectInput
								name="statusFilter"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value.toString())}
								options={statusOptions}
								className="w-full"
							/>
						</div>
					</div>

					{/* Results Count */}
					<div className="mt-12 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
							<span className="text-sm font-medium text-muted-foreground">
								Showing <span className="text-primary font-semibold">{filteredData.length}</span> of{" "}
								<span className="text-card-foreground font-semibold">{data.length}</span> {itemType}
							</span>
						</div>
						{filteredData.length !== data.length && (
							<div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
								Filtered
							</div>
						)}
					</div>
				</div>

				{/* Advanced Filters Section */}
				{showAdvancedFilters && (
					<>
						{/* Advanced Filters Header */}
						<div
							className="px-8 py-6 border-t border-border/30 cursor-pointer group transition-all duration-300 hover:bg-muted/20 bg-gradient-to-r from-muted/10 via-transparent to-muted/10"
							onClick={() => setShowAdvancedFiltersPanel(!showAdvancedFiltersPanel)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-primary/15 group-hover:bg-primary/25 rounded-xl transition-all duration-300 group-hover:scale-105">
										<AdjustmentsHorizontalIcon className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
											Advanced Filters
										</h3>
										<p className="text-sm text-muted-foreground mt-1">
											Fine-tune your search with additional criteria
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									{hasActiveAdvancedFilters && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												resetAllFilters();
											}}
											className="px-4 py-2 text-xs font-semibold bg-warning/15 text-warning border border-warning/30 rounded-lg hover:bg-warning/25 transition-all duration-200 shadow-sm hover:shadow-md"
										>
											Clear All
										</button>
									)}
									<div className="p-2 rounded-lg bg-muted/20 group-hover:bg-muted/30 transition-all duration-200">
										{showAdvancedFiltersPanel ? (
											<ChevronUpIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200 transform group-hover:scale-110" />
										) : (
											<ChevronDownIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200 transform group-hover:scale-110" />
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Advanced Filters Content */}
						{showAdvancedFiltersPanel && (
							<div
								className={`px-8 py-6 space-y-6 border-t border-border/20 bg-gradient-to-br from-muted/5 via-transparent to-accent/5 ${
									!disableAnimations ? "animate-fade-in-up" : ""
								}`}
							>
								{/* Date Range */}
								{enableDateRange && (
									<div>
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
											<DateTimePicker
												name="startDate"
												label="Start Date"
												value={startDate}
												onChange={(e) => setStartDate(e.target.value)}
												placeholder="Select start date"
												className="w-full"
												showTimeSelect={false}
											/>
											<DateTimePicker
												name="endDate"
												label="End Date"
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
												placeholder="Select end date"
												className="w-full"
												minDate={startDate ? new Date(startDate) : undefined}
												showTimeSelect={false}
											/>
										</div>
									</div>
								)}

								{/* Event Type and Toggle Filters */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									{/* Event Type Filter */}
									{enableEventType && (
										<div>
											<label className="block text-s font-semibold text-card-foreground mb-3">
												Event Type
											</label>
											<SelectInput
												name="eventType"
												value={eventType}
												onChange={(e) => setEventType(e.target.value.toString())}
												options={eventTypeOptions}
												className="w-full"
											/>
										</div>
									)}

									{/* Toggle Filters */}
									{(enableOnlineOnly || enableFeaturedOnly || enableFreeOnly) && (
										<div>
											<label className="block text-s font-semibold text-card-foreground mb-3">
												Quick Filters
											</label>
											<div className="flex items-center gap-6 lg:h-[45px]">
												{enableOnlineOnly && (
													<Switch
														enabled={isOnlineOnly}
														onChange={(event) => setIsOnlineOnly(event.target.checked)}
														label="Online Only"
													/>
												)}
												{enableFeaturedOnly && (
													<Switch
														enabled={isFeaturedOnly}
														onChange={(event) => setIsFeaturedOnly(event.target.checked)}
														label="Featured Only"
													/>
												)}
												{enableFreeOnly && (
													<Switch
														enabled={isFreeOnly}
														onChange={(event) => setIsFreeOnly(event.target.checked)}
														label="Free Only"
													/>
												)}
											</div>
										</div>
									)}
								</div>

								{/* Organizer and Registration Range */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
									{/* Organizer Filter */}
									{enableOrganizer && (
										<FormInput
											type="text"
											name="organizer"
											label="Organizer Name"
											placeholder="Search by organizer..."
											value={organizer}
											onChange={(e) => setOrganizer(e.target.value)}
											icon={<UserGroupIcon className="w-4 h-4" />}
											className="w-full"
										/>
									)}

									{/* Registration Range */}
									{enableRegistrationRange && (
										<>
											<FormInput
												type="number"
												name="minRegistrations"
												label="Min Registrations"
												placeholder="0"
												value={minRegistrations}
												onChange={(e) => setMinRegistrations(e.target.value)}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
											<FormInput
												type="number"
												name="maxRegistrations"
												label="Max Registrations"
												placeholder="∞"
												value={maxRegistrations}
												onChange={(e) => setMaxRegistrations(e.target.value)}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
										</>
									)}
								</div>

								{/* Price Range */}
								{enablePriceRange && (
									<div>
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
											<FormInput
												type="number"
												name="minPrice"
												label="Min Price"
												placeholder="0"
												value={minPrice}
												onChange={(e) => setMinPrice(e.target.value)}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
											<FormInput
												type="number"
												name="maxPrice"
												label="Max Price"
												placeholder="∞"
												value={maxPrice}
												onChange={(e) => setMaxPrice(e.target.value)}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
										</div>
									</div>
								)}

								{/* Active Filters Summary */}
								{hasActiveAdvancedFilters && (
									<div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
												<span className="text-sm font-medium text-card-foreground">
													<span className="text-primary font-semibold">
														{filteredData.length}
													</span>{" "}
													of {data.length} {itemType} shown
												</span>
											</div>
											<button
												onClick={resetAllFilters}
												className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
											>
												Clear All
											</button>
										</div>
									</div>
								)}

								{/* Reset Filters Button */}
								<div className="pt-2 border-t border-border/20">
									<button
										onClick={resetAllFilters}
										className="w-full px-4 py-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-card-foreground rounded-lg transition-all duration-200 font-medium text-sm border border-border/30 hover:border-border"
									>
										Reset All Filters
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		);
	}
);

SearchAndFilter.displayName = "SearchAndFilter";

export default SearchAndFilter;
