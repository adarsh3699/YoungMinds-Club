import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
	BriefcaseIcon,
	ClockIcon,
	MapPinIcon,
	CurrencyDollarIcon,
	ChevronRightIcon,
	BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { InternshipCardData } from "@/types";

const FeaturedInternships: React.FC = () => {
	const [internships, setInternships] = useState<InternshipCardData[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch featured internships
	useEffect(() => {
		const fetchFeaturedInternships = async () => {
			try {
				setLoading(true);
				const response = await axios.get("/internships", {
					params: {
						featured: "true",
						limit: 3,
						sort: "createdAt",
					},
				});

				if (response.data.success) {
					setInternships(response.data.internships);
				}
			} catch (error) {
				console.error("Error fetching featured internships:", error);
				// Fallback to empty array on error
				setInternships([]);
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedInternships();
	}, []);

	const formatDeadline = (deadline: string) => {
		const deadlineDate = new Date(deadline);
		const now = new Date();
		const timeDiff = deadlineDate.getTime() - now.getTime();
		const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

		if (daysDiff < 0) {
			return "Deadline passed";
		} else if (daysDiff === 0) {
			return "Due today";
		} else if (daysDiff <= 7) {
			return `${daysDiff} day${daysDiff === 1 ? "" : "s"} left`;
		} else {
			return deadline;
		}
	};

	const getDeadlineColor = (deadline: string) => {
		const deadlineDate = new Date(deadline);
		const now = new Date();
		const timeDiff = deadlineDate.getTime() - now.getTime();
		const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

		if (daysDiff < 0) {
			return "ym-text-error";
		} else if (daysDiff <= 7) {
			return "ym-text-yellow-600";
		} else {
			return "ym-text-success";
		}
	};

	// Helper functions for rendering internship data
	const getCompanyName = (internship: InternshipCardData) => {
		return internship.company?.name || "Company";
	};

	const getLocationDisplay = (internship: InternshipCardData) => {
		if (internship.location?.type === "remote") {
			return "Remote";
		}
		return internship.location?.city ? `${internship.location.city}` : "Location TBD";
	};

	const getCompensationDisplay = (internship: InternshipCardData) => {
		if (internship.compensation?.type === "Paid" && internship.compensation?.amount) {
			const currency = internship.compensation.currency === "INR" ? "₹" : "$";
			return `${currency}${internship.compensation.amount.toLocaleString()}/month`;
		} else if (internship.stipend) {
			return `₹${internship.stipend.toLocaleString()}/month`;
		}
		return "Unpaid";
	};

	const getGradientForCategory = (category: string) => {
		const gradients: { [key: string]: string } = {
			Technology: "from-blue-200 to-purple-200",
			Marketing: "from-green-200 to-teal-200",
			"Data Science": "from-orange-200 to-red-200",
			Finance: "from-yellow-200 to-orange-200",
			Design: "from-pink-200 to-purple-200",
			Sales: "from-cyan-200 to-blue-200",
		};
		return gradients[category] || "from-gray-200 to-gray-300";
	};

	// Don't render the section if loading or no featured internships
	if (loading || internships.length === 0) {
		return null;
	}

	return (
		<section className="py-20 ym-internships-bg" id="internships">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold ym-text-primary mb-4 animate-on-scroll">
						Featured <span className="gradient-text">Internships</span>
					</h2>
					<p className="text-xl ym-text-secondary max-w-3xl mx-auto animate-on-scroll">
						Discover amazing internship opportunities to kickstart your career and gain valuable experience.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{internships.slice(0, 3).map((internship) => (
						<div
							key={internship._id || internship.id}
							className="animate-on-scroll smooth-hover-card ym-bg-card rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-2 overflow-hidden border ym-border-card h-full flex flex-col"
						>
							<div
								className={`aspect-video bg-gradient-to-br ${getGradientForCategory(
									internship.category || "Technology"
								)} relative`}
							>
								{internship.logo ? (
									<img
										src={internship.logo}
										alt={internship.title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
										<BriefcaseIcon className="w-16 h-16 ym-text-white-80" />
									</div>
								)}
								<span className="absolute top-4 left-4 ym-bg-white-90 ym-text-primary px-3 py-1 rounded-full text-sm font-medium">
									{internship.type || internship.category}
								</span>
								<span className="absolute top-4 right-4 ym-bg-success ym-text-white px-3 py-1 rounded-full text-sm font-medium">
									{getCompensationDisplay(internship)}
								</span>
							</div>

							<div className="p-6 flex flex-col flex-grow">
								<h3 className="text-xl font-semibold ym-text-card mb-2">{internship.title}</h3>
								<p className="ym-text-secondary mb-4 line-clamp-2">
									{internship.internshipDescription ||
										"Learn and grow with this exciting internship opportunity."}
								</p>

								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm ym-text-muted">
										<BuildingOfficeIcon className="w-4 h-4 mr-2" />
										{getCompanyName(internship)}
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<MapPinIcon className="w-4 h-4 mr-2" />
										{getLocationDisplay(internship)}
									</div>
									{internship.duration && (
										<div className="flex items-center text-sm ym-text-muted">
											<ClockIcon className="w-4 h-4 mr-2" />
											{internship.duration}
										</div>
									)}
									<div className="flex items-center text-sm">
										<ClockIcon className="w-4 h-4 mr-2 ym-text-muted" />
										<span
											className={`font-medium ${getDeadlineColor(
												internship.applicationDeadline
											)}`}
										>
											{formatDeadline(internship.applicationDeadline)}
										</span>
									</div>
									<div className="flex items-center text-sm ym-text-muted">
										<CurrencyDollarIcon className="w-4 h-4 mr-2" />
										{getCompensationDisplay(internship)}
									</div>
								</div>

								<Link
									to={`/internship/${internship._id || internship.id}`}
									className="block w-full py-3 text-center font-bold ym-text-white gradient-bg rounded-lg transition-all duration-300 transform hover:scale-105 mt-auto"
								>
									Apply Now
								</Link>
							</div>
						</div>
					))}
				</div>

				<div className="text-center">
					<Link
						to="/internships"
						className="inline-flex items-center px-8 py-4 text-lg font-medium ym-btn-secondary hover:ym-bg-card-hover rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
					>
						View All Internships
						<ChevronRightIcon className="w-5 h-5 ml-2" />
					</Link>
				</div>
			</div>
		</section>
	);
};

export default FeaturedInternships;
