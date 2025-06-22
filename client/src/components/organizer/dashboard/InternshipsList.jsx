import { Link } from 'react-router-dom';
import { BriefcaseIcon, UsersIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import { SelectInput } from '../../common';

const InternshipsList = ({ internships, internshipFilter, setInternshipFilter, filterOptions, onCreateInternship }) => {
	const getFilteredInternships = () => {
		const now = new Date();

		if (internshipFilter === 'active') {
			return internships.filter(
				(internship) => new Date(internship.applicationDeadline) >= now && internship.status !== 'draft'
			);
		} else if (internshipFilter === 'expired') {
			return internships.filter(
				(internship) => new Date(internship.applicationDeadline) < now && internship.status !== 'draft'
			);
		} else if (internshipFilter === 'draft') {
			return internships.filter((internship) => internship.status === 'draft');
		}

		return internships;
	};

	const filteredInternships = getFilteredInternships();

	const formatDeadline = (deadline) => {
		const now = new Date();
		const deadlineDate = new Date(deadline);
		const timeDiff = deadlineDate - now;
		const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

		if (daysDiff < 0) {
			return 'Expired';
		} else if (daysDiff === 0) {
			return 'Today';
		} else if (daysDiff === 1) {
			return '1 day left';
		} else {
			return `${daysDiff} days left`;
		}
	};

	const getDeadlineColor = (deadline) => {
		const now = new Date();
		const deadlineDate = new Date(deadline);
		const timeDiff = deadlineDate - now;
		const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

		if (daysDiff < 0) {
			return 'ym-text-error';
		} else if (daysDiff <= 3) {
			return 'ym-text-yellow-600';
		} else {
			return 'ym-text-success';
		}
	};

	return (
		<div className="ym-bg-card rounded-lg shadow-md border ym-border-card overflow-hidden animate-fade-in mb-25">
			<div className="p-6 pb-0">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold ym-text-primary">My Internships</h2>
					<div className="flex space-x-4 items-center">
						<div className="w-48">
							<SelectInput
								value={internshipFilter}
								onChange={(e) => setInternshipFilter(e.target.value)}
								options={filterOptions}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="p-6">
				{filteredInternships.length === 0 ? (
					<div className="text-center py-8">
						<p className="ym-text-muted mb-4">
							You don't have any {internshipFilter !== 'all' ? internshipFilter : ''} internships yet.
						</p>
						<button
							onClick={onCreateInternship}
							className="inline-flex items-center px-6 py-3 gradient-bg text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
						>
							<PlusIcon className="h-5 w-5 mr-2" />
							Create Your First Internship
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredInternships.map((internship) => (
							<div
								key={internship._id}
								className="ym-bg-card border ym-border-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
							>
								{internship.poster ? (
									<img
										src={internship.poster}
										alt={internship.title}
										className="w-full h-48 object-cover"
									/>
								) : (
									<div className="w-full h-48 ym-hero-image-bg flex items-center justify-center">
										<BriefcaseIcon className="h-12 w-12 text-white" />
									</div>
								)}

								<div className="p-4">
									<div className="flex justify-between items-start mb-2">
										<div>
											<h3 className="text-lg font-semibold ym-text-primary mb-1">
												{internship.title}
											</h3>
											<p className="text-sm ym-text-secondary">{internship.companyName}</p>
										</div>
										{internship.status === 'draft' && (
											<span className="ym-bg-amber-100 ym-text-yellow-700 text-xs px-2 py-1 rounded">
												Draft
											</span>
										)}
									</div>

									<div className="flex items-center mb-2">
										<ClockIcon className="h-4 w-4 mr-1 ym-text-muted" />
										<span
											className={`text-sm font-medium ${getDeadlineColor(
												internship.applicationDeadline
											)}`}
										>
											{formatDeadline(internship.applicationDeadline)}
										</span>
									</div>

									<p className="ym-text-secondary text-sm mb-3">
										{new Date(internship.applicationDeadline).toLocaleDateString()}
									</p>

									<div className="flex items-center ym-text-muted text-sm mb-4">
										<UsersIcon className="h-4 w-4 mr-1" />
										<span>{internship.applicationCount || 0} applications</span>
									</div>

									<div className="flex justify-between">
										<Link
											to={`/organizer/internship/${internship._id}`}
											className="ym-text-yellow-600 hover:underline text-sm font-medium"
										>
											Manage Internship
										</Link>

										<Link
											to={`/internship/${internship._id}`}
											className="ym-text-secondary hover:underline text-sm"
										>
											View Internship
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default InternshipsList;
