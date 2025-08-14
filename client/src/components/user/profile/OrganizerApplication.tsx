import React from "react";
import { ArrowUpTrayIcon, CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { OrganizerApplicationProps } from "@/types";

const OrganizerApplication: React.FC<OrganizerApplicationProps> = ({
	applyingForOrganizer,
	organizerApplication,
	saving,
	organizerStatus,
	reapplicationCount = 0,
	maxReapplications = 3,
	onApplicationChange,
	onSubmitApplication,
	onToggleApplication,
	onEditApplication,
	onCancelApplication,
	onUpdateApplication,
}) => {
	// Function to render status-specific content
	const renderStatusContent = () => {
		switch (organizerStatus) {
			case "pending":
				return (
					<div className="text-center py-8">
						<div className="ym-bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
							<ClockIcon className="h-10 w-10 ym-text-yellow-600" />
						</div>
						<h3 className="text-2xl font-bold ym-text-primary mb-4">Application Under Review</h3>
						<p className="ym-text-secondary text-lg mb-4">
							Your organizer application has been submitted and is currently being reviewed by our admin
							team.
						</p>
						<p className="ym-text-secondary mb-6">
							You'll receive an email notification once your application has been processed. Thank you for
							your patience!
						</p>

						{/* Application management buttons */}
						<div className="flex justify-center space-x-4">
							<button
								onClick={onEditApplication}
								className="px-4 py-2 text-sm font-medium ym-text-primary border ym-border-card rounded-lg hover:ym-bg-card-hover transition-all duration-300"
							>
								Edit Application
							</button>
							<button
								onClick={onCancelApplication}
								className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-300"
							>
								Cancel Application
							</button>
						</div>
					</div>
				);
			case "approved":
				return (
					<div className="text-center py-8">
						<div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
							<CheckIcon className="h-10 w-10 ym-text-green-600" />
						</div>
						<h3 className="text-2xl font-bold ym-text-primary mb-4">
							Congratulations! You're an Approved Organizer
						</h3>
						<p className="ym-text-secondary text-lg mb-4">
							Your organizer application has been approved. You can now create and manage events and
							internships.
						</p>
						<div className="flex justify-center space-x-4">
							<a
								href="/organizer/dashboard"
								className="px-6 py-3 gradient-bg text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
							>
								Go to Organizer Dashboard
							</a>
						</div>
					</div>
				);
			case "rejected": {
				const canReapply = reapplicationCount < maxReapplications;
				const remainingAttempts = maxReapplications - reapplicationCount;

				return (
					<div className="text-center py-8">
						<div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
							<XMarkIcon className="h-10 w-10 ym-text-red-600" />
						</div>

						<h3 className="text-2xl font-bold ym-text-primary mb-4">Application Not Approved</h3>
						<p className="ym-text-secondary text-lg mb-4">
							Unfortunately, your organizer application was not approved at this time.
						</p>

						{canReapply ? (
							<>
								<p className="ym-text-secondary mb-4">
									Please review the requirements and consider applying again. You have{" "}
									<span className="font-medium text-amber-600">
										{remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining
									</span>
									.
								</p>
								<button
									onClick={onToggleApplication}
									className="px-6 py-3 gradient-bg text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
								>
									Apply Again
								</button>
							</>
						) : (
							<>
								<p className="ym-text-secondary mb-4">
									You have reached the maximum number of application attempts ({maxReapplications}).
								</p>
								<p className="ym-text-secondary mb-6">
									If you believe this was an error or have questions, please contact our support team
									for assistance.
								</p>
								<a
									href="/contact"
									className="px-6 py-3 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all duration-300 inline-block"
								>
									Contact Support
								</a>
							</>
						)}
					</div>
				);
			}
			default: // 'none' case
				return (
					<div className="text-center py-8">
						<div className="ym-bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
							<ArrowUpTrayIcon className="h-10 w-10 ym-text-yellow-600" />
						</div>
						<p className="ym-text-secondary mb-6 text-lg">
							Want to create and host your own events? Apply to become an organizer!
						</p>
						<button
							onClick={onToggleApplication}
							className="px-8 py-4 text-lg font-medium gradient-bg text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center mx-auto"
						>
							<ArrowUpTrayIcon className="h-5 w-5 mr-3" />
							Apply to Become an Organizer
						</button>
					</div>
				);
		}
	};

	return (
		<div className="ym-bg-card rounded-xl shadow-lg p-8 border ym-border-card animate-fade-in">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold ym-text-primary mb-2">Become an Organizer</h2>
					<p className="ym-text-secondary">
						Join our community of event organizers and help shape the future of learning
					</p>
				</div>

				{applyingForOrganizer &&
				(organizerStatus === "none" || organizerStatus === "rejected" || organizerStatus === "pending") ? (
					<form
						onSubmit={organizerStatus === "pending" ? onUpdateApplication : onSubmitApplication}
						className="grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						<div className="mb-4">
							<label
								htmlFor="organizationName"
								className="block text-sm font-medium ym-text-primary mb-1"
							>
								Organization Name
							</label>
							<input
								type="text"
								id="organizationName"
								name="organizationName"
								value={organizerApplication.organizationName}
								onChange={onApplicationChange}
								className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
								required
							/>
						</div>

						<div className="mb-4">
							<label htmlFor="socialLinks" className="block text-sm font-medium ym-text-primary mb-1">
								Social links or portfolio (optional)
							</label>
							<input
								type="text"
								id="socialLinks"
								name="socialLinks"
								value={organizerApplication.socialLinks || ""}
								onChange={onApplicationChange}
								className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
								placeholder="LinkedIn, portfolio website, etc."
							/>
						</div>

						<div className="mb-4 md:col-span-2">
							<label htmlFor="reason" className="block text-sm font-medium ym-text-primary mb-1">
								Why do you want to become an organizer?
							</label>
							<textarea
								id="reason"
								name="reason"
								rows={3}
								value={organizerApplication.reason}
								onChange={onApplicationChange}
								className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
								required
							/>
						</div>

						<div className="mb-6 md:col-span-2">
							<label htmlFor="experience" className="block text-sm font-medium ym-text-primary mb-1">
								Previous event organization experience
							</label>
							<textarea
								id="experience"
								name="experience"
								rows={3}
								value={organizerApplication.experience}
								onChange={onApplicationChange}
								className="w-full px-3 py-2 border ym-border-card rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ym-bg-card ym-text-card transition-all duration-300"
								required
							/>
						</div>

						<div className="flex justify-end space-x-3 md:col-span-2">
							<button
								type="button"
								onClick={onToggleApplication}
								className="px-4 py-2 text-sm font-medium ym-text-card border ym-border-card rounded-lg hover:ym-bg-card-hover transition-all duration-300"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 text-sm font-medium text-white gradient-bg rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
								disabled={saving}
							>
								{saving ? (
									<>
										<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
										{organizerStatus === "pending" ? "Updating..." : "Submitting..."}
									</>
								) : organizerStatus === "pending" ? (
									"Update Application"
								) : (
									"Submit Application"
								)}
							</button>
						</div>
					</form>
				) : (
					renderStatusContent()
				)}
			</div>
		</div>
	);
};

export default OrganizerApplication;
