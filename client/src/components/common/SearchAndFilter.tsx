import React, { memo, useState } from 'react';
import {
	MagnifyingGlassIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	AdjustmentsHorizontalIcon,
	MapPinIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline';
import { FormInput, SelectInput, Switch, DateTimePicker } from '.';
import { UserSearchFiltersProps } from '@/types';

// Extended props interface for advanced filters
interface AdvancedFiltersConfig {
	showAdvancedFilters?: boolean;
	dateRange?: {
		startDate: string;
		endDate: string;
		setStartDate: (date: string) => void;
		setEndDate: (date: string) => void;
	};
	location?: {
		value: string;
		setValue: (location: string) => void;
		options?: string[];
	};
	eventType?: {
		value: string;
		setValue: (eventType: string) => void;
		options: { value: string; label: string }[];
	};
	organizer?: {
		value: string;
		setValue: (organizer: string) => void;
	};
	registrationRange?: {
		min: string;
		max: string;
		setMin: (min: string) => void;
		setMax: (max: string) => void;
	};
	priceRange?: {
		min: string;
		max: string;
		setMin: (min: string) => void;
		setMax: (max: string) => void;
	};
	toggleFilters?: {
		isOnlineOnly?: {
			value: boolean;
			setValue: (value: boolean) => void;
		};
		isFeaturedOnly?: {
			value: boolean;
			setValue: (value: boolean) => void;
		};
	};
	onResetAllFilters?: () => void;
}

interface EnhancedSearchFiltersProps extends UserSearchFiltersProps {
	advancedFilters?: AdvancedFiltersConfig;
}

/**
 * Enhanced SearchFilters component with advanced filtering capabilities
 * All filter options are passed as props - no hardcoded business logic
 */
const searchAndFillter: React.FC<EnhancedSearchFiltersProps> = memo(
	({
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
		// Advanced filters
		advancedFilters,
	}) => {
		const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

		// Check if any advanced filters are active
		const hasActiveAdvancedFilters =
			advancedFilters &&
			(advancedFilters.dateRange?.startDate ||
				advancedFilters.dateRange?.endDate ||
				advancedFilters.location?.value ||
				advancedFilters.eventType?.value ||
				advancedFilters.organizer?.value ||
				advancedFilters.registrationRange?.min ||
				advancedFilters.registrationRange?.max ||
				advancedFilters.priceRange?.min ||
				advancedFilters.priceRange?.max ||
				advancedFilters.toggleFilters?.isOnlineOnly?.value ||
				advancedFilters.toggleFilters?.isFeaturedOnly?.value);

		return (
			<div
				className="glass-effect rounded-3xl shadow-xl mb-8 animate-fade-in relative z-20 border border-border/20 backdrop-blur-lg"
				style={{
					animationDelay,
					animationFillMode: 'both',
				}}
			>
				{/* Basic Filters Section */}
				<div className="px-8 pt-8 pb-4 bg-gradient-to-br from-card/95 via-card/90 to-muted/30">
					<div className="flex flex-col lg:flex-row gap-6">
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
							<div className="min-w-[200px]">
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
							<div className="min-w-[200px]">
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
						<div className="min-w-[200px]">
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
					<div className="mt-12 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
							<span className="text-sm font-medium text-muted-foreground">
								Showing <span className="text-primary font-semibold">{filteredCount}</span> of{' '}
								<span className="text-card-foreground font-semibold">{totalCount}</span> {itemType}
							</span>
						</div>
						{filteredCount !== totalCount && (
							<div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
								Filtered
							</div>
						)}
					</div>
				</div>

				{/* Advanced Filters Section */}
				{advancedFilters?.showAdvancedFilters && (
					<>
						{/* Advanced Filters Header */}
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
												advancedFilters.onResetAllFilters?.();
											}}
											className="px-4 py-2 text-xs font-semibold bg-warning/15 text-warning border border-warning/30 rounded-lg hover:bg-warning/25 transition-all duration-200 shadow-sm hover:shadow-md"
										>
											Clear All
										</button>
									)}
									<div className="p-2 rounded-lg bg-muted/20 group-hover:bg-muted/30 transition-all duration-200">
										{showAdvancedFilters ? (
											<ChevronUpIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200 transform group-hover:scale-110" />
										) : (
											<ChevronDownIcon className="w-5 h-5 text-muted-foreground group-hover:text-card-foreground transition-all duration-200 transform group-hover:scale-110" />
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Advanced Filters Content */}
						{showAdvancedFilters && (
							<div className="px-8 py-6 space-y-6 border-t border-border/20 bg-gradient-to-br from-muted/5 via-transparent to-accent/5 animate-fade-in-up">
								{/* Date Range */}
								{advancedFilters.dateRange && (
									<div>
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
											<DateTimePicker
												name="startDate"
												label="Start Date"
												value={advancedFilters.dateRange.startDate}
												onChange={(e) =>
													advancedFilters.dateRange?.setStartDate(e.target.value)
												}
												placeholder="Select start date"
												className="w-full"
												showTimeSelect={false}
											/>
											<DateTimePicker
												name="endDate"
												label="End Date"
												value={advancedFilters.dateRange.endDate}
												onChange={(e) => advancedFilters.dateRange?.setEndDate(e.target.value)}
												placeholder="Select end date"
												className="w-full"
												minDate={
													advancedFilters.dateRange.startDate
														? new Date(advancedFilters.dateRange.startDate)
														: undefined
												}
												showTimeSelect={false}
											/>
										</div>
									</div>
								)}

								{/* Location, Event Type, and Toggle Filters */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
									{/* Event Type Filter */}
									{advancedFilters.eventType && (
										<div>
											<label className="block text-s font-semibold text-card-foreground mb-3">
												Event Type
											</label>
											<SelectInput
												name="eventType"
												value={advancedFilters.eventType.value}
												onChange={(e) =>
													advancedFilters.eventType?.setValue(e.target.value.toString())
												}
												options={advancedFilters.eventType.options}
												className="w-full"
											/>
										</div>
									)}

									{/* Location Filter */}
									{advancedFilters.location && (
										<FormInput
											type="text"
											name="location"
											label="Location/City"
											placeholder="Enter city name..."
											value={advancedFilters.location.value}
											onChange={(e) => advancedFilters.location?.setValue(e.target.value)}
											icon={<MapPinIcon className="w-4 h-4" />}
											className="w-full"
										/>
									)}

									{/* Toggle Filters */}
									{advancedFilters.toggleFilters && (
										<div>
											<label className="block text-s font-semibold text-card-foreground mb-3">
												Quick Filters
											</label>
											<div className="flex items-center gap-6 lg:h-[45px]">
												{advancedFilters.toggleFilters.isOnlineOnly && (
													<Switch
														enabled={advancedFilters.toggleFilters.isOnlineOnly.value}
														onChange={(event) =>
															advancedFilters.toggleFilters?.isOnlineOnly?.setValue(
																event.target.checked
															)
														}
														label="Online Only"
													/>
												)}
												{advancedFilters.toggleFilters.isFeaturedOnly && (
													<Switch
														enabled={advancedFilters.toggleFilters.isFeaturedOnly.value}
														onChange={(event) =>
															advancedFilters.toggleFilters?.isFeaturedOnly?.setValue(
																event.target.checked
															)
														}
														label="Featured Only"
													/>
												)}
											</div>
										</div>
									)}
								</div>

								{/* Organizer and Registration Range */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
									{/* Organizer Filter */}
									{advancedFilters.organizer && (
										<FormInput
											type="text"
											name="organizer"
											label="Organizer Name"
											placeholder="Search by organizer..."
											value={advancedFilters.organizer.value}
											onChange={(e) => advancedFilters.organizer?.setValue(e.target.value)}
											icon={<UserGroupIcon className="w-4 h-4" />}
											className="w-full"
										/>
									)}

									{/* Registration Range */}
									{advancedFilters.registrationRange && (
										<>
											<FormInput
												type="number"
												name="minRegistrations"
												label="Min Registrations"
												placeholder="0"
												value={advancedFilters.registrationRange.min}
												onChange={(e) =>
													advancedFilters.registrationRange?.setMin(e.target.value)
												}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
											<FormInput
												type="number"
												name="maxRegistrations"
												label="Max Registrations"
												placeholder="∞"
												value={advancedFilters.registrationRange.max}
												onChange={(e) =>
													advancedFilters.registrationRange?.setMax(e.target.value)
												}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
										</>
									)}
								</div>

								{/* Price Range */}
								{advancedFilters.priceRange && (
									<div>
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
											<FormInput
												type="number"
												name="minPrice"
												label="Min Price"
												placeholder="0"
												value={advancedFilters.priceRange.min}
												onChange={(e) => advancedFilters.priceRange?.setMin(e.target.value)}
												className="w-full"
												min="0"
												allowNegative={false}
											/>
											<FormInput
												type="number"
												name="maxPrice"
												label="Max Price"
												placeholder="∞"
												value={advancedFilters.priceRange.max}
												onChange={(e) => advancedFilters.priceRange?.setMax(e.target.value)}
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
													<span className="text-primary font-semibold">{filteredCount}</span>{' '}
													of {totalCount} {itemType} shown
												</span>
											</div>
											<button
												onClick={() => advancedFilters.onResetAllFilters?.()}
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
										onClick={() => advancedFilters.onResetAllFilters?.()}
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

searchAndFillter.displayName = 'searchAndFillter';

export default searchAndFillter;
