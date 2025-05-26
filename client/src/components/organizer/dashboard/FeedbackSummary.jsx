import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';

const FeedbackSummary = ({ feedbackSummary }) => {
	if (!feedbackSummary) {
		return null;
	}

	return (
		<div className="ym-bg-card p-6 rounded-lg shadow-md border ym-border-card mb-8 animate-fade-in">
			<h2 className="text-xl font-semibold ym-text-primary mb-4">Feedback Summary</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
				<div className="ym-bg-orange-400 bg-opacity-10 p-4 rounded-lg">
					<h3 className="font-medium ym-text-card mb-1">Total Feedback</h3>
					<div className="text-2xl font-bold text-white">
						{feedbackSummary.overallStats?.totalFeedback || 0}
					</div>
				</div>
				<div className="ym-bg-amber-100 p-4 rounded-lg">
					<h3 className="font-medium ym-text-card mb-1">Average Rating</h3>
					<div className="flex items-baseline">
						<span className="text-2xl font-bold ym-text-yellow-600">
							{feedbackSummary.overallStats?.averageRating
								? feedbackSummary.overallStats.averageRating.toFixed(1)
								: 'N/A'}
						</span>
						<span className="ym-text-secondary ml-1">/5</span>
					</div>
				</div>
				<div className="ym-bg-success bg-opacity-10 p-4 rounded-lg">
					<h3 className="font-medium ym-text-card mb-1">Positive Comments</h3>
					<div className="text-2xl font-bold text-white">{feedbackSummary.data?.positiveCount || 0}</div>
				</div>
			</div>

			{feedbackSummary.recentFeedback && feedbackSummary.recentFeedback.length > 0 && (
				<div>
					<h3 className="text-lg font-medium ym-text-primary mb-3">Recent Feedback</h3>
					<div className="space-y-3">
						{feedbackSummary.recentFeedback.slice(0, 3).map((feedback, index) => (
							<div key={index} className="ym-bg-card-hover p-3 rounded-lg border ym-border-card">
								<div className="flex justify-between">
									<span className="ym-text-card font-medium">{feedback.eventTitle}</span>
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<StarIcon
												key={i}
												className={`h-4 w-4 ${
													i < feedback.rating
														? 'text-yellow-500 fill-current'
														: 'text-gray-300'
												}`}
											/>
										))}
									</div>
								</div>
								<p className="ym-text-secondary text-sm mt-1">{feedback.comment}</p>
							</div>
						))}
					</div>
					<Link
						to="/organizer/feedback"
						className="ym-text-yellow-600 text-sm mt-4 inline-block hover:underline"
					>
						View all feedback →
					</Link>
				</div>
			)}
		</div>
	);
};

export default FeedbackSummary;
