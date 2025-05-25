import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const OrganizerApplication = ({
	applyingForOrganizer,
	organizerApplication,
	saving,
	onApplicationChange,
	onSubmitApplication,
	onToggleApplication,
}) => {
	return (
		<div className="ym-bg-card rounded-xl shadow-lg p-8 border ym-border-card animate-fade-in">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold ym-text-primary mb-2">Become an Organizer</h2>
					<p className="ym-text-secondary">
						Join our community of event organizers and help shape the future of learning
					</p>
				</div>

				{applyingForOrganizer ? (
					<form onSubmit={onSubmitApplication} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
								value={organizerApplication.socialLinks}
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
										Submitting...
									</>
								) : (
									'Submit Application'
								)}
							</button>
						</div>
					</form>
				) : (
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
				)}
			</div>
		</div>
	);
};

export default OrganizerApplication;
