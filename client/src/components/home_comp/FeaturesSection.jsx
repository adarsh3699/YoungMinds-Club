import {
	MagnifyingGlassIcon,
	UsersIcon,
	MapPinIcon,
	StarIcon,
	ShieldCheckIcon,
	BoltIcon,
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
	const features = [
		{
			icon: MagnifyingGlassIcon,
			title: 'Smart Event Discovery',
			description:
				'AI-powered recommendations help you find events perfectly matched to your interests and career goals.',
			color: 'from-purple-500 to-purple-600',
		},
		{
			icon: UsersIcon,
			title: 'Professional Networking',
			description: 'Connect with like-minded professionals, mentors, and industry leaders in your field.',
			color: 'from-blue-500 to-blue-600',
		},
		{
			icon: MapPinIcon,
			title: 'Local & Virtual Events',
			description: 'Discover opportunities both in your city and online, expanding your reach globally.',
			color: 'from-green-500 to-green-600',
		},
		{
			icon: StarIcon,
			title: 'Quality Assurance',
			description: 'All events and internships are verified to ensure authentic, valuable experiences.',
			color: 'from-yellow-500 to-yellow-600',
		},
		{
			icon: ShieldCheckIcon,
			title: 'Secure Platform',
			description: 'Your data and privacy are protected with enterprise-grade security measures.',
			color: 'from-red-500 to-red-600',
		},
		{
			icon: BoltIcon,
			title: 'Instant Applications',
			description: 'One-click applications and seamless registration process for all opportunities.',
			color: 'from-indigo-500 to-indigo-600',
		},
	];

	return (
		<section className="py-20 ym-features-bg" id="features">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold ym-text-primary mb-4 animate-on-scroll">
						Why Choose <span className="gradient-text">YoungMinds</span>?
					</h2>
					<p className="text-xl ym-text-secondary max-w-3xl mx-auto animate-on-scroll">
						We're revolutionizing how young professionals discover opportunities and build meaningful
						connections.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => {
						const Icon = feature.icon;

						return (
							<div
								key={index}
								className="animate-on-scroll ym-bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border ym-border-card p-6"
							>
								<div
									className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
								>
									<Icon className="w-6 h-6 ym-text-white" />
								</div>
								<h3 className="text-xl font-semibold ym-text-card mb-2">{feature.title}</h3>
								<p className="ym-text-secondary">{feature.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default FeaturesSection;
