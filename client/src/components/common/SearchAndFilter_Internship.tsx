import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import {
	MagnifyingGlassIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { FormInput, SelectInput, SearchableSelect, Switch, DateTimePicker } from ".";
import { SelectOption, InternshipDiscoverData } from "@/types";
import { INTERNSHIP_DURATION, INTERNSHIP_CITIES, INTERNSHIP_CATEGORIES } from "../../utils/internshipConstants";
import axios from "axios";

// Types
interface FilterData {
	categoryArray: Array<{ name: string; label: string }>;
	cityArray: string[];
	loading: boolean;
	error: string | null;
}

interface FilterState {
	searchTerm: string;
	categoryFilter: string;
	internshipTypeFilter: string;

	locationFilter: string;
	startingFromDate: string;
	maxDuration: string;
	minStipend: string;
	maxStipend: string;
	isRemoteOnly: boolean;
	isPaidOnly: boolean;
}

interface SearchAndFilterInternshipConfig {
	data: InternshipDiscoverData[];
	onFilteredDataChange: (filteredData: InternshipDiscoverData[]) => void;
	itemType?: string;
	searchPlaceholder?: string;
	animationDelay?: string;
	disableAnimations?: boolean;
	internshipTypeOptions?: SelectOption[];
	durationOptions?: SelectOption[];
}

// Cache utilities
const CACHE_KEY = "internship_filter_data";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const cacheUtils = {
	get: (): { categoryArray: FilterData["categoryArray"]; cityArray: FilterData["cityArray"] } | null => {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;

			const { data, timestamp } = JSON.parse(cached);
			if (Date.now() - timestamp < CACHE_DURATION) return data;

			localStorage.removeItem(CACHE_KEY);
			return null;
		} catch {
			localStorage.removeItem(CACHE_KEY);
			return null;
		}
	},

	set: (data: { categoryArray: FilterData["categoryArray"]; cityArray: FilterData["cityArray"] }) => {
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
		} catch (error) {
			console.error("Cache error:", error);
		}
	},
};

// Filter utilities
const filterUtils = {
	search: (items: InternshipDiscoverData[], query: string) => {
		if (!query.trim()) return items;
		const lowerQuery = query.toLowerCase();
		return items.filter((item) =>
			[item.title, item.category, item.location?.city, item.company?.name, ...(item.skills || [])].some((field) =>
				field?.toLowerCase().includes(lowerQuery)
			)
		);
	},

	byField: (items: InternshipDiscoverData[], field: string, value: string) =>
		!value
			? items
			: items.filter((item) => {
					const fieldValue = field.includes(".")
						? field
								.split(".")
								.reduce(
									(obj: Record<string, unknown>, key) => obj?.[key] as Record<string, unknown>,
									item as unknown as Record<string, unknown>
								)
						: (item as unknown as Record<string, unknown>)[field];
					return fieldValue === value;
			  }),

	byDateRange: (items: InternshipDiscoverData[], startDate: string) =>
		!startDate ? items : items.filter((item) => item.startDate && new Date(item.startDate) >= new Date(startDate)),

	byDuration: (items: InternshipDiscoverData[], maxDuration: string) =>
		!maxDuration
			? items
			: items.filter((item) => {
					if (!item.duration) return true;
					const maxMonths = parseInt(maxDuration.split(" ")[0]);
					const itemMonths = parseInt(item.duration.split(" ")[0]);
					return itemMonths <= maxMonths;
			  }),

	byStipend: (items: InternshipDiscoverData[], min: string, max: string) => {
		let result = items;

		if (min) {
			const minAmount = Number(min);
			result = result.filter((item) =>
				item.compensation?.type === "Paid" && item.compensation?.amount
					? item.compensation.amount >= minAmount
					: minAmount === 0
			);
		}

		if (max) {
			const maxAmount = Number(max);
			result = result.filter((item) =>
				item.compensation?.type === "Paid" && item.compensation?.amount
					? item.compensation.amount <= maxAmount
					: true
			);
		}

		return result;
	},
};

// Custom hook for API data
const useFilterData = () => {
	const [filterData, setFilterData] = useState<FilterData>({
		categoryArray: [],
		cityArray: [],
		loading: true,
		error: null,
	});

	useEffect(() => {
		const fetchData = async () => {
			const cached = cacheUtils.get();

			if (cached) {
				setFilterData({ ...cached, loading: false, error: null });
				return;
			}

			try {
				const response = await axios.get("/filters/internships_cat_loc");

				if (response.data.success) {
					const apiData = {
						categoryArray: response.data.data.categoryArray,
						cityArray: response.data.data.cityArray,
					};

					cacheUtils.set(apiData);
					setFilterData({ ...apiData, loading: false, error: null });
				} else {
					throw new Error("API request failed");
				}
			} catch {
				// Fallback to constants
				const fallbackData = {
					categoryArray: INTERNSHIP_CATEGORIES.slice(1).map((cat) => ({
						name: cat.value,
						label: cat.label,
					})),
					cityArray: INTERNSHIP_CITIES,
				};

				setFilterData({
					...fallbackData,
					loading: false,
					error: "Using default data",
				});
			}
		};

		fetchData();
	}, []);

	return filterData;
};

// Main component
const SearchAndFilter_Internship: React.FC<SearchAndFilterInternshipConfig> = memo(
	({
		data,
		onFilteredDataChange,
		itemType = "internships",
		searchPlaceholder = "Search internships by title, skills, category, or location...",
		animationDelay = "0.3s",
		disableAnimations = false,
		internshipTypeOptions = [{ label: "All Types", value: "" }],
		durationOptions = INTERNSHIP_DURATION,
	}) => {
		// Filter state
		const [filters, setFilters] = useState<FilterState>({
			searchTerm: "",
			categoryFilter: "",
			internshipTypeFilter: "",
			locationFilter: "",
			startingFromDate: "",
			maxDuration: "",
			minStipend: "",
			maxStipend: "",
			isRemoteOnly: false,
			isPaidOnly: false,
		});

		const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
		const filterData = useFilterData();

		// Transform API data to options
		const categoryOptions = useMemo(
			() => filterData.categoryArray.map((cat) => ({ value: cat.name, label: cat.label })),
			[filterData.categoryArray]
		);

		const locationOptions = useMemo(
			() => filterData.cityArray.map((city) => ({ value: city, label: city })),
			[filterData.cityArray]
		);

		// Filter update handler
		const updateFilter = useCallback((key: keyof FilterState, value: string | boolean | number) => {
			setFilters((prev) => ({ ...prev, [key]: value }));
		}, []);

		// Apply all filters
		const filteredData = useMemo(() => {
			if (!data?.length) return [];

			let result = filterUtils.search(data, filters.searchTerm);

			// Apply basic filters
			result = filterUtils.byField(result, "category", filters.categoryFilter);
			result = filterUtils.byField(result, "type", filters.internshipTypeFilter);
			result = filterUtils.byField(result, "location.city", filters.locationFilter);

			// Apply advanced filters
			result = filterUtils.byDateRange(result, filters.startingFromDate);
			result = filterUtils.byDuration(result, filters.maxDuration);
			result = filterUtils.byStipend(result, filters.minStipend, filters.maxStipend);

			// Apply quick filters
			if (filters.isRemoteOnly) {
				result = result.filter((item) => item.location?.type === "remote");
			}
			if (filters.isPaidOnly) {
				result = result.filter((item) => item.compensation?.type === "Paid");
			}

			return result;
		}, [data, filters]);

		// Notify parent of changes
		useEffect(() => {
			onFilteredDataChange(filteredData);
		}, [filteredData, onFilteredDataChange]);

		// Reset filters
		const resetAllFilters = useCallback(() => {
			setFilters({
				searchTerm: "",
				categoryFilter: "",
				internshipTypeFilter: "",
				locationFilter: "",
				startingFromDate: "",
				maxDuration: "",
				minStipend: "",
				maxStipend: "",
				isRemoteOnly: false,
				isPaidOnly: false,
			});
		}, []);

		// Check active advanced filters
		const hasActiveAdvancedFilters = useMemo(
			() =>
				Object.entries(filters).some(
					([key, value]) =>
						[
							"categoryFilter",
							"startingFromDate",
							"maxDuration",
							"locationFilter",
							"minStipend",
							"maxStipend",
							"isRemoteOnly",
							"isPaidOnly",
						].includes(key) && (typeof value === "boolean" ? value : value !== "")
				),
			[filters]
		);

		return (
			<div
				className={`glass-effect rounded-3xl shadow-xl mb-8 relative z-20 border border-border/20 backdrop-blur-lg ${
					!disableAnimations ? "animate-fade-in" : ""
				}`}
				style={!disableAnimations ? { animationDelay, animationFillMode: "both" } : {}}
			>
				{/* Basic Filters */}
				<div className="px-8 pt-8 pb-4 rounded-t-xl bg-gradient-to-br from-card/95 via-card/90 to-muted/30">
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="flex-1">
							<FormInput
								type="text"
								name="search"
								placeholder={searchPlaceholder}
								value={filters.searchTerm}
								onChange={(e) => updateFilter("searchTerm", e.target.value)}
								icon={<MagnifyingGlassIcon className="w-5 h-5" />}
								className="w-full"
							/>
						</div>

						{[
							{ key: "internshipTypeFilter", options: internshipTypeOptions },
							{ key: "maxDuration", options: durationOptions },
						].map(({ key, options }) => (
							<div key={key} className="min-w-[200px]">
								<SelectInput
									name={key}
									value={filters[key as keyof FilterState] as string}
									onChange={(e) => updateFilter(key as keyof FilterState, e.target.value)}
									options={options}
									className="w-full"
								/>
							</div>
						))}
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

				{/* Advanced Filters */}
				<div
					className="px-8 py-6 border-t border-border/30 cursor-pointer group transition-all duration-300 hover:bg-muted/20 bg-gradient-to-r from-muted/10 via-transparent to-muted/10"
					onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
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
									className="px-4 py-2 text-xs font-semibold bg-warning/15 text-warning border border-warning/30 rounded-lg hover:bg-warning/25 transition-all duration-200"
								>
									Clear All
								</button>
							)}
							<div className="p-2 rounded-lg bg-muted/20 group-hover:bg-muted/30 transition-all duration-200">
								{showAdvancedFilters ? (
									<ChevronUpIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200" />
								) : (
									<ChevronDownIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200" />
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Advanced Filters Content */}
				{showAdvancedFilters && (
					<div
						className={`px-8 py-6 space-y-6 border-t border-border/20 bg-gradient-to-br from-muted/5 via-transparent to-accent/5 ${
							!disableAnimations ? "animate-fade-in-up" : ""
						}`}
					>
						{/* Starting From and Quick Filters */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<DateTimePicker
								name="startingFromDate"
								label="Starting From"
								value={filters.startingFromDate}
								onChange={(e) => updateFilter("startingFromDate", e.target.value)}
								placeholder="Select start date"
								className="w-full"
								showTimeSelect={false}
								minDate={new Date()}
							/>

							<div>
								<label className="block text-sm font-semibold text-card-foreground mb-3">
									Quick Filters
								</label>
								<div className="flex items-center gap-6 lg:h-[45px]">
									{[
										{ key: "isRemoteOnly", label: "Remote Only" },
										{ key: "isPaidOnly", label: "Paid Only" },
									].map(({ key, label }) => (
										<Switch
											key={key}
											enabled={filters[key as keyof FilterState] as boolean}
											onChange={(e) => updateFilter(key as keyof FilterState, e.target.checked)}
											label={label}
										/>
									))}
								</div>
							</div>
						</div>

						{/* Category and Location */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{[
								{ key: "categoryFilter", label: "Category", options: categoryOptions },
								{ key: "locationFilter", label: "Location", options: locationOptions },
							].map(({ key, label, options }) => (
								<div key={key}>
									<SearchableSelect
										id={key}
										name={key}
										value={filters[key as keyof FilterState] as string}
										onChange={(e) => updateFilter(key as keyof FilterState, e.target.value)}
										options={options}
										label={label}
										placeholder={`Search ${label.toLowerCase()}...`}
									/>
								</div>
							))}
						</div>

						{/* Stipend Range */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{[
								{
									key: "minStipend",
									label: "Min Stipend",
									placeholder: "0",
									tooltip: "Minimum stipend amount in INR",
								},
								{
									key: "maxStipend",
									label: "Max Stipend",
									placeholder: "∞",
									tooltip: "Maximum stipend amount in INR",
								},
							].map(({ key, label, placeholder, tooltip }) => (
								<FormInput
									key={key}
									type="number"
									name={key}
									label={label}
									placeholder={placeholder}
									value={filters[key as keyof FilterState] as string}
									onChange={(e) => updateFilter(key as keyof FilterState, e.target.value)}
									className="w-full"
									min="0"
									allowNegative={false}
									tooltip={tooltip}
								/>
							))}
						</div>

						{/* Active Filters Summary */}
						{hasActiveAdvancedFilters && (
							<div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
										<span className="text-sm font-medium text-card-foreground">
											<span className="text-primary font-semibold">{filteredData.length}</span> of{" "}
											{data.length} {itemType} shown
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

						{/* Reset Button */}
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
			</div>
		);
	}
);

SearchAndFilter_Internship.displayName = "SearchAndFilter_Internship";

export default SearchAndFilter_Internship;
