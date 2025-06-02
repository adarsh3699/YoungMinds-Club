import React from 'react';

const EventCardSkeleton: React.FC = () => {
	return (
		<div className="relative rounded-xl overflow-hidden">
			{/* Card Container */}
			<div className="ym-bg-card rounded-xl overflow-hidden shadow-md border ym-border-card flex flex-col h-full animate-pulse">
				{/* Image placeholder */}
				<div className="relative h-52 ym-bg-yellow-100">
					{/* Category Badge placeholder */}
					<div className="absolute top-3 right-3 z-10">
						<div className="h-6 w-16 ym-bg-amber-200 rounded-full"></div>
					</div>

					{/* Organizer Badge placeholder */}
					<div className="absolute top-3 left-3 z-10">
						<div className="h-6 w-24 ym-bg-amber-200 rounded-full"></div>
					</div>

					{/* Price Tag placeholder */}
					<div className="absolute bottom-3 right-3 z-10">
						<div className="h-6 w-14 ym-bg-amber-200 rounded-lg"></div>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-4 flex-grow flex flex-col">
					{/* Title with Bookmark placeholder */}
					<div className="flex justify-between items-start mb-4">
						<div className="h-6 ym-bg-yellow-100 rounded w-3/4"></div>
						<div className="w-5 h-5 ym-bg-yellow-100 rounded-sm ml-2"></div>
					</div>

					{/* Countdown Timer placeholder */}
					<div className="mb-4">
						<div className="h-4 ym-bg-yellow-100 rounded w-1/3 mb-2"></div>
						<div className="flex space-x-2">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="h-10 ym-bg-yellow-100 rounded w-1/4"></div>
							))}
						</div>
					</div>

					{/* Description placeholder */}
					<div className="h-4 ym-bg-yellow-100 rounded w-full mb-1"></div>
					<div className="h-4 ym-bg-yellow-100 rounded w-4/5 mb-4"></div>

					{/* Meta Information placeholders */}
					<div className="space-y-2 mb-4">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="flex items-center">
								<div className="w-4 h-4 mr-2 ym-bg-yellow-100 rounded-full"></div>
								<div className="h-4 ym-bg-yellow-100 rounded w-2/5"></div>
							</div>
						))}
					</div>

					{/* Registration Stats placeholder */}
					<div className="mt-auto">
						{/* Progress bar placeholder */}
						<div className="w-full h-2 ym-bg-yellow-100 rounded-full mb-2"></div>

						{/* Stats placeholders */}
						<div className="flex justify-between mb-3">
							<div className="h-3 ym-bg-yellow-100 rounded w-1/4"></div>
							<div className="h-3 ym-bg-yellow-100 rounded w-1/4"></div>
						</div>

						{/* Button placeholder */}
						<div className="h-10 ym-bg-amber-200 rounded-lg w-full"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventCardSkeleton; 