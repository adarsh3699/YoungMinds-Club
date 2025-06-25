import React, { memo, useState, useEffect, useMemo } from "react";
import {
	MagnifyingGlassIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { FormInput, SelectInput, Switch, DateTimePicker } from ".";
import { SelectOption, InternshipDiscoverData } from "@/types";
import { INTERNSHIP_DURATION } from "../../utils/internshipConstants";

// Configuration interface for the component
interface SearchAndFilterInternshipConfig {
	// Data and filtering
	data: InternshipDiscoverData[];
	onFilteredDataChange: (filteredData: InternshipDiscoverData[]) => void;

	// UI Configuration
	itemType?: string;
	searchPlaceholder?: string;
	animationDelay?: string;
	disableAnimations?: boolean;

	// Filter options
	categoryOptions?: SelectOption[];
	internshipTypeOptions?: SelectOption[];
	compensationOptions?: SelectOption[];
	locationTypeOptions?: SelectOption[];
	durationOptions?: SelectOption[];
}

/**
 * Internship-specific SearchAndFilter component
 */
const SearchAndFilter_Internship: React.FC<SearchAndFilterInternshipConfig> = memo(
	({
		data,
		onFilteredDataChange,
		itemType = "internships",
		searchPlaceholder = "Search internships by title, skills, category, or location...",
		animationDelay = "0.3s",
		disableAnimations = false,
		categoryOptions = [{ label: "All Categories", value: "" }],
		internshipTypeOptions = [{ label: "All Types", value: "" }],
		compensationOptions = [{ label: "All Compensation", value: "" }],
		locationTypeOptions = [
			{ label: "All Locations", value: "" },
			{ label: "Remote", value: "remote" },
			{ label: "On-site", value: "on-site" },
			{ label: "Hybrid", value: "hybrid" },
		],
		durationOptions = INTERNSHIP_DURATION,
	}) => {
		// Basic filter states
		const [searchTerm, setSearchTerm] = useState<string>("");
		const [categoryFilter, setCategoryFilter] = useState<string>("");
		const [internshipTypeFilter, setInternshipTypeFilter] = useState<string>("");
		const [compensationFilter, setCompensationFilter] = useState<string>("");
		const [locationTypeFilter, setLocationTypeFilter] = useState<string>("");

		// Advanced filter states
		const [showAdvancedFiltersPanel, setShowAdvancedFiltersPanel] = useState(false);
		const [startingFromDate, setStartingFromDate] = useState<string>("");
		const [maxDuration, setMaxDuration] = useState<string>("");
		const [isRemoteOnly, setIsRemoteOnly] = useState<boolean>(false);
		const [isPaidOnly, setIsPaidOnly] = useState<boolean>(false);

		// Filtering logic
		const filteredData = useMemo(() => {
			if (!data || data.length === 0) return [];

			let result = [...data];

			// Apply search filter
			if (searchTerm.trim()) {
				const query = searchTerm.toLowerCase().trim();
				result = result.filter((item) => {
					// Search in title
					const titleMatch = item.title.toLowerCase().includes(query);

					// Search in category
					const categoryMatch = item.category && item.category.toLowerCase().includes(query);

					// Search in skills
					const skillsMatch = item.skills && item.skills.some((skill) => skill.toLowerCase().includes(query));

					// Search in location (city)
					const locationMatch = item.location?.city && item.location.city.toLowerCase().includes(query);

					// Search in company name
					const companyMatch = item.company?.name && item.company.name.toLowerCase().includes(query);

					return titleMatch || categoryMatch || skillsMatch || locationMatch || companyMatch;
				});
			}

			// Apply category filter
			if (categoryFilter && categoryFilter !== "") {
				result = result.filter((item) => item.category === categoryFilter);
			}

			// Apply internship type filter
			if (internshipTypeFilter && internshipTypeFilter !== "") {
				result = result.filter((item) => item.type === internshipTypeFilter);
			}

			// Apply compensation filter
			if (compensationFilter && compensationFilter !== "") {
				result = result.filter((item) => item.compensation?.type === compensationFilter);
			}

			// Apply location type filter
			if (locationTypeFilter && locationTypeFilter !== "") {
				result = result.filter((item) => item.location?.type === locationTypeFilter);
			}

			// Apply starting from date filter
			if (startingFromDate) {
				const startingFromDateObj = new Date(startingFromDate);
				result = result.filter((item) => item.startDate && new Date(item.startDate) >= startingFromDateObj);
			}

			// Apply max duration filter
			if (maxDuration && maxDuration !== "") {
				// Convert duration to months for comparison
				const maxDurationMonths = parseInt(maxDuration.split(" ")[0]);
				result = result.filter((item) => {
					if (!item.duration) return true;
					const itemDurationMonths = parseInt(item.duration.split(" ")[0]);
					return itemDurationMonths <= maxDurationMonths;
				});
			}

			// Apply remote only filter
			if (isRemoteOnly) {
				result = result.filter((item) => item.location?.type === "remote");
			}

			// Apply paid only filter
			if (isPaidOnly) {
				result = result.filter((item) => item.compensation?.type === "Paid");
			}

			return result;
		}, [
			data,
			searchTerm,
			categoryFilter,
			internshipTypeFilter,
			compensationFilter,
			locationTypeFilter,
			startingFromDate,
			maxDuration,
			isRemoteOnly,
			isPaidOnly,
		]);

		// Notify parent of filtered data changes
		useEffect(() => {
			onFilteredDataChange(filteredData);
		}, [filteredData, onFilteredDataChange]);

		// Reset all filters
		const resetAllFilters = () => {
			setSearchTerm("");
			setCategoryFilter("");
			setInternshipTypeFilter("");
			setCompensationFilter("");
			setLocationTypeFilter("");
			setStartingFromDate("");
			setMaxDuration("");
			setIsRemoteOnly(false);
			setIsPaidOnly(false);
		};

		// Check if any advanced filters are active
		const hasActiveAdvancedFilters = startingFromDate || maxDuration || isRemoteOnly || isPaidOnly;

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
						<div className="min-w-[200px]">
							<SelectInput
								name="categoryFilter"
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value.toString())}
								options={categoryOptions}
								className="w-full"
							/>
						</div>

						{/* Internship Type Filter */}
						<div className="min-w-[200px]">
							<SelectInput
								name="internshipTypeFilter"
								value={internshipTypeFilter}
								onChange={(e) => setInternshipTypeFilter(e.target.value.toString())}
								options={internshipTypeOptions}
								className="w-full"
							/>
						</div>

						{/* Compensation Filter */}
						<div className="min-w-[200px]">
							<SelectInput
								name="compensationFilter"
								value={compensationFilter}
								onChange={(e) => setCompensationFilter(e.target.value.toString())}
								options={compensationOptions}
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
							{/* Starting From Date and Duration */}
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
								<DateTimePicker
									name="startingFromDate"
									label="Starting From"
									value={startingFromDate}
									onChange={(e) => setStartingFromDate(e.target.value)}
									placeholder="Select start date"
									className="w-full"
									showTimeSelect={false}
									minDate={new Date()}
								/>

								<div>
									<label className="block text-sm font-semibold text-card-foreground mb-3">
										Max. Duration (Months)
									</label>
									<SelectInput
										name="maxDuration"
										value={maxDuration}
										onChange={(e) => setMaxDuration(e.target.value.toString())}
										options={durationOptions}
										className="w-full"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-card-foreground mb-3">
										Location Type
									</label>
									<SelectInput
										name="locationTypeFilter"
										value={locationTypeFilter}
										onChange={(e) => setLocationTypeFilter(e.target.value.toString())}
										options={locationTypeOptions}
										className="w-full"
									/>
								</div>
							</div>

							{/* Quick Filters */}
							<div>
								<label className="block text-sm font-semibold text-card-foreground mb-3">
									Quick Filters
								</label>
								<div className="flex items-center gap-6 lg:h-[45px]">
									<Switch
										enabled={isRemoteOnly}
										onChange={(event) => setIsRemoteOnly(event.target.checked)}
										label="Remote Only"
									/>
									<Switch
										enabled={isPaidOnly}
										onChange={(event) => setIsPaidOnly(event.target.checked)}
										label="Paid Only"
									/>
								</div>
							</div>

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
			</div>
		);
	}
);

SearchAndFilter_Internship.displayName = "SearchAndFilter_Internship";

export default SearchAndFilter_Internship;
