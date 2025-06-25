import React, { useState, useEffect, useMemo } from "react";
import axios, { AxiosResponse } from "axios";
import InternshipCard from "../components/common/InternshipCard";
import { SearchAndFilter } from "../components/common";
import EventCardSkeleton from "../components/organizer/EventCardSkeleton";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { InternshipDiscoverData, InternshipsApiResponse, SelectOption } from "@/types";
import { INTERNSHIP_CATEGORIES, INTERNSHIP_TYPES } from "../utils/internshipConstants";

// Sort options for internships
const SORT_OPTIONS: SelectOption[] = [
	{ label: "All Status", value: "all" },
	{ label: "Most Popular", value: "popular" },
	{ label: "Recently Posted", value: "recent" },
	{ label: "Deadline Soon", value: "deadline" },
	{ label: "High Stipend", value: "stipend" },
	{ label: "Remote Only", value: "remote" },
];

const InternshipDiscoverPage: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// State for internships data
	const [internships, setInternships] = useState<InternshipDiscoverData[]>([]);
	const [filteredInternships, setFilteredInternships] = useState<InternshipDiscoverData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Transform internship data to be compatible with SearchAndFilter
	const transformInternshipForFilter = React.useCallback((internship: InternshipDiscoverData) => {
		return {
			...internship,
			date: internship.startDate, // Map startDate to date for filtering
			location: internship.location,
			organizer: internship.company ? { name: internship.company.name } : undefined, // Map company to organizer
			registrationCount: internship.applicationCount, // Map applicationCount to registrationCount
			price: internship.stipend || 0, // Map stipend to price for filtering
		};
	}, []);

	// Fetch internships data
	useEffect(() => {
		const fetchInternships = async () => {
			setLoading(true);
			try {
				const response: AxiosResponse<InternshipsApiResponse> = await axios.get("/internships");
				if (response.data.success) {
					const internshipsData = response.data.internships as InternshipDiscoverData[];
					setInternships(internshipsData);
					setFilteredInternships(internshipsData);
				} else {
					console.error("Error fetching internships:", response.data.message);
					setError("Failed to load internships. Please try again later.");
					setInternships([]);
					setFilteredInternships([]);
				}
			} catch (err) {
				console.error("Error fetching internships:", err);
				setError("Failed to load internships. Please try again later.");
				setInternships([]);
				setFilteredInternships([]);
			} finally {
				setLoading(false);
			}
		};

		fetchInternships();
	}, []);

	// Handle filtered data changes from SearchAndFilter component
	const handleFilteredDataChange = React.useCallback((filtered: any[]) => {
		// eslint-disable-line @typescript-eslint/no-explicit-any
		setFilteredInternships(filtered as InternshipDiscoverData[]);
	}, []);

	// Memoize the transformed data to prevent infinite re-renders
	const transformedInternships = useMemo(() => {
		return internships.map(transformInternshipForFilter);
	}, [internships, transformInternshipForFilter]);

	// Handle saving/unsaving internship
	const handleSaveToggle = React.useCallback(
		async (internshipId: string): Promise<void> => {
			if (!isAuthenticated) {
				// Redirect to login if not authenticated
				navigate("/login");
				return;
			}

			try {
				// Always use POST method, as the server endpoint handles both save and unsave
				await axios.post(`/internships/${internshipId}/save`);
			} catch (error) {
				console.error("Error toggling saved internship:", error);
			}
		},
		[isAuthenticated, navigate]
	);

	// Error state
	if (error) {
		return (
			<div className="container mx-auto px-4 py-12 mt-6">
				<div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
					<strong className="font-bold">Error! </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ym-events-bg pb-50">
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="mb-8 text-center p-20">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold ym-text-primary mb-4">
						Discover <span className="gradient-text">Internships</span>
					</h1>
					<p className="text-lg md:text-xl ym-text-secondary max-w-2xl mx-auto">
						Find and apply for exciting internship opportunities with top companies
					</p>
				</div>

				{/* Search and Filter Section */}
				<SearchAndFilter
					data={transformedInternships}
					onFilteredDataChange={handleFilteredDataChange}
					itemType="internships"
					searchPlaceholder="Search internships by title, company, location, or skills..."
					animationDelay="0.1s"
					showCategory={true}
					showAdvancedFilters={true}
					categoryOptions={INTERNSHIP_CATEGORIES}
					statusOptions={SORT_OPTIONS}
					eventTypeOptions={INTERNSHIP_TYPES}
					enableDateRange={true}
					enableEventType={true}
					enableOrganizer={true}
					enableRegistrationRange={false}
					enablePriceRange={true}
					enableOnlineOnly={true}
					enableFreeOnly={false}
				/>

				{/* Internships Grid */}
				<div>
					{loading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<EventCardSkeleton key={i} />
							))}
						</div>
					) : filteredInternships.length === 0 ? (
						<div className="ym-bg-card rounded-lg p-8 text-center border ym-border-card shadow-md">
							<svg
								className="mx-auto h-12 w-12 ym-text-muted"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2"
								/>
							</svg>
							<h3 className="mt-2 text-lg font-medium ym-text-primary">No internships found</h3>
							<p className="mt-1 text-sm ym-text-secondary">
								Try adjusting your search or filter criteria to find internships.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{filteredInternships.map((internship) => (
								<InternshipCard
									key={internship._id}
									internship={internship}
									onSaveToggle={handleSaveToggle}
									onManage={() => {}}
									onEdit={() => {}}
									onDelete={() => {}}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InternshipDiscoverPage;
