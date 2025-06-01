import React from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, TrophyIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';

const About: React.FC = () => {
	return (
		<div className="min-h-screen bg-white">
			<div className="py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-6xl font-bold mb-6 ym-text-primary">
							About <span className="gradient-text">YoungMinds</span>
						</h1>
						<p className="text-xl ym-text-secondary max-w-3xl mx-auto">
							Empowering young professionals through exceptional events and career opportunities.
						</p>
					</div>

					{/* Our Story Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
						<div>
							<h2 className="text-3xl font-bold mb-4 ym-text-primary">Our Story</h2>
							<p className="text-lg ym-text-secondary mb-6">
								Founded in 2023, YoungMinds started with a simple vision: to create a bridge between
								ambitious young professionals and the opportunities they deserve. What began as a small
								initiative to organize career workshops has evolved into a comprehensive platform
								connecting event organizers, companies, and young talents.
							</p>
							<p className="text-lg ym-text-secondary">
								Today, we're proud to facilitate thousands of connections each month, helping shape the
								careers of tomorrow's leaders while providing event organizers with access to engaged,
								passionate audiences.
							</p>
						</div>
						<div className="ym-hero-image-bg rounded-2xl p-8 h-80 flex items-center justify-center">
							<div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
								<div className="text-center">
									<UsersIcon className="w-16 h-16 text-yellow-700 mx-auto mb-4" />
									<p className="text-yellow-800 text-xl font-medium">Connecting bright minds</p>
								</div>
							</div>
						</div>
					</div>

					{/* Our Values Section */}
					<div className="mb-16">
						<h2 className="text-3xl font-bold text-center mb-12 ym-text-primary">Our Values</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Excellence Card */}
							<div className="ym-bg-card rounded-lg shadow-md border ym-border-card">
								<div className="p-8 text-center">
									<div className="w-16 h-16 ym-bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<StarIcon className="w-8 h-8 ym-text-yellow-600" />
									</div>
									<h3 className="text-xl font-bold mb-3 ym-text-card">Excellence</h3>
									<p className="ym-text-secondary">
										We're committed to providing exceptional experiences and opportunities that
										truly make a difference.
									</p>
								</div>
							</div>

							{/* Growth Card */}
							<div className="ym-bg-card rounded-lg shadow-md border ym-border-card">
								<div className="p-8 text-center">
									<div className="w-16 h-16 ym-bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<TrophyIcon className="w-8 h-8 ym-text-yellow-600" />
									</div>
									<h3 className="text-xl font-bold mb-3 ym-text-card">Growth</h3>
									<p className="ym-text-secondary">
										We believe in continuous learning and creating environments where everyone can
										develop their potential.
									</p>
								</div>
							</div>

							{/* Community Card */}
							<div className="ym-bg-card rounded-lg shadow-md border ym-border-card">
								<div className="p-8 text-center">
									<div className="w-16 h-16 ym-bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<HeartIcon className="w-8 h-8 ym-text-yellow-600" />
									</div>
									<h3 className="text-xl font-bold mb-3 ym-text-card">Community</h3>
									<p className="ym-text-secondary">
										We foster meaningful connections and collaborations that create lasting impact
										in our community.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Call to Action Section */}
					<div className="text-center">
						<h2 className="text-3xl font-bold mb-6 ym-text-primary">Join Our Journey</h2>
						<p className="text-xl ym-text-secondary max-w-3xl mx-auto mb-8">
							Whether you're looking to attend events, find internships, or organize your own gatherings,
							YoungMinds is here to support your professional journey.
						</p>
						<Link
							to="/auth"
							className="inline-flex items-center px-8 py-4 text-lg font-medium ym-text-white gradient-bg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
						>
							Get Started Today
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
