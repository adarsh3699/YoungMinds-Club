import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import {
	ArrowLeftIcon,
	PencilIcon,
	DocumentDuplicateIcon,
	ArrowDownTrayIcon,
	UsersIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";
import CreateInternshipModal from "../../components/organizer/CreateInternshipModal";
import { Modal, Tabs } from "../../components/common";
import { InternshipDetailsData } from "@/types";

// Custom tab item interface to allow JSX labels
interface InternshipTabItem {
	id: string;
	key?: string;
	label: React.ReactNode;
	content: React.ReactNode;
}

// Applicant data interface
interface ApplicantData {
	id: string;
	userId: string;
	name: string;
	email: string;
	profilePicture?: string;
	applicationDate: string;
	status: "pending" | "accepted" | "rejected";
	coverLetter?: string;
	resume?: string;
}

// API Response interfaces
interface InternshipManageApiResponse {
	success: boolean;
	internship: InternshipDetailsData;
}

interface ApplicantsApiResponse {
	success: boolean;
	count: number;
	applicants: ApplicantData[];
}

const InternshipManagePage: React.FC = () => {
	const { id: internshipId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [internship, setInternship] = useState<InternshipDetailsData | null>(null);
	const [applicants, setApplicants] = useState<ApplicantData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditModal, setShowEditModal] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("applicants");

	// Fetch internship and applicant data
	useEffect(() => {
		const fetchData = async (): Promise<void> => {
			try {
				setLoading(true);
				// Fetch internship details
				const internshipResponse: AxiosResponse<InternshipManageApiResponse> = await axios.get(
					`/organizer/internships/${internshipId}`
				);
				setInternship(internshipResponse.data.internship);

				// Fetch applicants
				const applicantsResponse: AxiosResponse<ApplicantsApiResponse> = await axios.get(
					`/organizer/internships/${internshipId}/applicants`
				);
				setApplicants(applicantsResponse.data.applicants);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching internship data:", error);
				setError("Failed to load internship data. Please try again.");
				setLoading(false);
			}
		};

		fetchData();
	}, [internshipId]);

	const formatDateOnly = (dateString: string): string => {
		try {
			return format(new Date(dateString), "MMMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const handleEditSuccess = (updatedInternship: InternshipDetailsData): void => {
		setShowEditModal(false);
		setInternship(updatedInternship);
	};

	const handleDuplicateInternship = (): void => {
		if (!internship) return;

		const internshipToDuplicate = { ...internship };
		// Remove specific fields
		delete (internshipToDuplicate as Record<string, unknown>)._id;
		delete (internshipToDuplicate as Record<string, unknown>).createdAt;
		delete (internshipToDuplicate as Record<string, unknown>).updatedAt;

		// Set a default title to indicate it's a duplicate
		internshipToDuplicate.title = `Copy of ${internshipToDuplicate.title}`;

		localStorage.setItem("duplicateInternship", JSON.stringify(internshipToDuplicate));
		navigate("/organizer/dashboard");
	};

	const downloadCSV = (): void => {
		if (!internship) return;

		// Format applicants data for CSV
		const csvContent = [
			// CSV Header
			["Name", "Email", "Application Date", "Status", "Cover Letter", "Resume"].join(","),
			// CSV Data Rows
			...applicants.map((applicant) =>
				[
					applicant.name,
					applicant.email,
					format(new Date(applicant.applicationDate), "yyyy-MM-dd"),
					applicant.status,
					applicant.coverLetter ? "Provided" : "Not provided",
					applicant.resume ? "Provided" : "Not provided",
				].join(",")
			),
		].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `${internship.title.replace(/\s+/g, "_")}_applicants.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-gray-200">
				<div className="text-red-400 mb-4">{error}</div>
				<button
					onClick={() => navigate("/organizer/dashboard")}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				>
					Return to Dashboard
				</button>
			</div>
		);
	}

	if (!internship) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-gray-200">
				<div className="text-red-400 mb-4">Internship not found or you do not have permission.</div>
				<button
					onClick={() => navigate("/organizer/dashboard")}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				>
					Return to Dashboard
				</button>
			</div>
		);
	}

	// Prepare the content for applicants tab
	const applicantsTabContent = (
		<div className="bg-gray-800 rounded-lg p-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold text-gray-200">Applicants ({applicants.length})</h3>
				{applicants.length > 0 && (
					<button
						onClick={downloadCSV}
						className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
					>
						<ArrowDownTrayIcon className="h-4 w-4 mr-1" />
						Download CSV
					</button>
				)}
			</div>

			{applicants.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-400">No one has applied for this internship yet.</p>
				</div>
			) : (
				<div className="table-scroll overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-700">
						<thead className="bg-gray-800">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Name
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Email
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Applied On
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
								>
									Documents
								</th>
							</tr>
						</thead>
						<tbody className="bg-gray-800 divide-y divide-gray-700">
							{applicants.map((applicant) => (
								<tr key={applicant.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
												{applicant.profilePicture ? (
													<img
														src={applicant.profilePicture}
														alt={applicant.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<span className="text-sm font-medium text-gray-300">
														{applicant.name.charAt(0).toUpperCase()}
													</span>
												)}
											</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-gray-200">
													{applicant.name}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-300">{applicant.email}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-300">
											{format(new Date(applicant.applicationDate), "MMM d, yyyy")}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												applicant.status === "accepted"
													? "bg-green-900 text-green-200"
													: applicant.status === "rejected"
													? "bg-red-900 text-red-200"
													: "bg-yellow-900 text-yellow-200"
											}`}
										>
											{applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex flex-col space-y-1">
											{applicant.coverLetter && (
												<span className="text-green-400 text-xs">Cover Letter</span>
											)}
											{applicant.resume && <span className="text-blue-400 text-xs">Resume</span>}
											{!applicant.coverLetter && !applicant.resume && (
												<span className="text-gray-500 text-xs">None</span>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);

	// Prepare the content for analytics tab
	const analyticsTabContent = (
		<div className="bg-gray-800 rounded-lg p-6">
			<h3 className="text-lg font-semibold mb-4 text-gray-200">Application Analytics</h3>

			<div className="bg-gray-700 p-6 rounded-lg">
				<p className="text-center text-gray-400 mb-4">
					Application analytics visualization will be available in a future update.
				</p>

				<div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Total Applications</h4>
						<p className="text-3xl font-bold text-blue-400">{internship.applicationCount}</p>
					</div>

					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Capacity Filled</h4>
						<p className="text-3xl font-bold text-green-400">
							{Math.round((internship.applicationCount / internship.capacity) * 100)}%
						</p>
					</div>

					<div className="bg-gray-600 p-4 rounded-lg shadow-sm">
						<h4 className="text-sm font-medium text-gray-300 mb-2">Acceptance Rate</h4>
						<p className="text-3xl font-bold text-purple-400">
							{applicants.length > 0
								? Math.round(
										(applicants.filter((a) => a.status === "accepted").length / applicants.length) *
											100
								  )
								: 0}
							%
						</p>
					</div>
				</div>
			</div>
		</div>
	);

	const tabs: InternshipTabItem[] = [
		{
			id: "applicants",
			key: "applicants",
			label: (
				<span className="flex items-center">
					<UsersIcon className="h-5 w-5 mr-2" />
					Applicants
				</span>
			),
			content: applicantsTabContent,
		},
		{
			id: "analytics",
			key: "analytics",
			label: (
				<span className="flex items-center">
					<ChartBarIcon className="h-5 w-5 mr-2" />
					Analytics
				</span>
			),
			content: analyticsTabContent,
		},
	];

	return (
		<div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-gray-200">
			{/* Back Button and Internship Title */}
			<div className="mb-6">
				<button
					onClick={() => navigate("/organizer/dashboard")}
					className="flex items-center text-blue-400 hover:text-blue-300 mb-2"
				>
					<ArrowLeftIcon className="h-4 w-4 mr-1" />
					Back to Dashboard
				</button>
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-white">{internship.title}</h1>
					<div className="flex space-x-2">
						<button
							onClick={() => setShowEditModal(true)}
							className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
						>
							<PencilIcon className="h-4 w-4 mr-1" />
							Edit
						</button>
						<button
							onClick={handleDuplicateInternship}
							className="flex items-center px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
						>
							<DocumentDuplicateIcon className="h-4 w-4 mr-1" />
							Duplicate
						</button>
					</div>
				</div>
			</div>

			{/* Internship Information */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-md overflow-hidden">
					{internship.logo && (
						<img src={internship.logo} alt={internship.title} className="w-full h-64 object-cover" />
					)}
					<div className="p-6">
						<div className="flex flex-wrap gap-2 mb-4">
							<span className="bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
								{internship.category}
							</span>
							<span className="bg-purple-900 text-purple-200 text-xs font-medium px-2.5 py-0.5 rounded">
								{internship.type}
							</span>
							<span className="bg-green-900 text-green-200 text-xs font-medium px-2.5 py-0.5 rounded">
								{internship.duration}
							</span>
							{internship.tags &&
								internship.tags.map((tag, index) => (
									<span
										key={index}
										className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded"
									>
										{tag}
									</span>
								))}
						</div>

						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold text-gray-200">Company</h3>
								<p className="text-gray-300 mt-1">
									{internship.companyName || internship.company?.name || "Company Name Not Available"}
								</p>
								{internship.companyDescription && (
									<p className="text-gray-400 mt-1 text-sm">{internship.companyDescription}</p>
								)}
							</div>

							{internship.internshipDescription && (
								<div>
									<h3 className="text-lg font-semibold text-gray-200">Description</h3>
									<p className="text-gray-300 mt-1 whitespace-pre-line">
										{internship.internshipDescription}
									</p>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h3 className="text-sm font-semibold text-gray-200">Start Date</h3>
									<p className="text-gray-300">{formatDateOnly(internship.startDate)}</p>
								</div>

								<div>
									<h3 className="text-sm font-semibold text-gray-200">Application Deadline</h3>
									<p className="text-gray-300">{formatDateOnly(internship.applicationDeadline)}</p>
								</div>

								<div>
									<h3 className="text-sm font-semibold text-gray-200">Location</h3>
									{internship.location.type === "remote" ? (
										<p className="text-gray-300">Remote</p>
									) : (
										<div>
											<p className="text-gray-300 capitalize">{internship.location.type}</p>
											{internship.location.city && (
												<p className="text-gray-300">{internship.location.city}</p>
											)}
											{internship.location.address && (
												<p className="text-gray-300">{internship.location.address}</p>
											)}
										</div>
									)}
								</div>

								<div>
									<h3 className="text-sm font-semibold text-gray-200">Compensation</h3>
									<p className="text-gray-300">
										{internship.compensation.type === "Paid"
											? `₹${internship.compensation.amount} ${internship.compensation.currency}`
											: "Unpaid"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-gray-800 rounded-lg shadow-md p-6">
					<h3 className="text-xl font-semibold mb-4 text-gray-200">Internship Stats</h3>
					<div className="space-y-4">
						<div className="bg-gray-700 p-4 rounded-lg">
							<p className="text-sm text-gray-300">Applications</p>
							<div className="flex items-end justify-between">
								<p className="text-3xl font-bold text-blue-400">{internship.applicationCount}</p>
								<p className="text-sm text-gray-400">of {internship.capacity} capacity</p>
							</div>
							<div className="mt-2 bg-gray-600 rounded-full h-2.5">
								<div
									className="bg-blue-500 h-2.5 rounded-full"
									style={{
										width: `${Math.min(
											100,
											(internship.applicationCount / internship.capacity) * 100
										)}%`,
									}}
								></div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-700 p-4 rounded-lg">
								<p className="text-sm text-gray-300">Status</p>
								<p className="text-lg font-bold text-green-400 capitalize">{internship.status}</p>
							</div>
							<div className="bg-gray-700 p-4 rounded-lg">
								<p className="text-sm text-gray-300">Duration</p>
								<p className="text-lg font-bold text-purple-400">{internship.duration}</p>
							</div>
						</div>

						{internship.skills && internship.skills.length > 0 && (
							<div className="border-t border-gray-700 pt-4">
								<h4 className="text-sm font-semibold text-gray-200 mb-2">Required Skills</h4>
								<div className="flex flex-wrap gap-1">
									{internship.skills.map((skill, index) => (
										<span
											key={index}
											className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-gray-800 shadow-md overflow-hidden border-0">
				<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
			</div>

			{/* Edit Internship Modal */}
			<Modal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				maxWidth="max-w-6xl"
				noPadding={true}
				showCloseButton={false}
			>
				{internship && (
					<CreateInternshipModal
						onClose={() => setShowEditModal(false)}
						onSuccess={handleEditSuccess}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						internshipToEdit={internship as any}
						isEditing={true}
					/>
				)}
			</Modal>
		</div>
	);
};

export default InternshipManagePage;
