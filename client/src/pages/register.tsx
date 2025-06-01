import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { RocketLaunchIcon, GiftIcon, ArrowPathIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			{/* Left side - Image/Brand */}
			<div className="hidden md:flex md:w-1/2 enhanced-hero-bg text-white p-12 flex-col justify-between relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-32 right-20 w-40 h-40 rounded-full bg-white animate-pulse"></div>
					<div className="absolute bottom-40 left-16 w-28 h-28 rounded-full bg-white animate-float"></div>
					<div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full bg-white animate-bounce"></div>
				</div>

				<div className="relative z-10">
					<div className="flex items-center mb-6">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl mr-4 shadow-lg">
							<RocketLaunchIcon className="w-8 h-8 text-amber-600" />
						</div>
						<div>
							<h1 className="text-4xl font-bold contrast-text-white-bold">YoungMinds Club</h1>
							<p className="contrast-text-white text-sm font-medium">Your journey starts here</p>
						</div>
					</div>
					<p className="text-xl contrast-text-white leading-relaxed">
						Join our community of young thinkers and explorers who are shaping the future.
					</p>
				</div>

				<div className="space-y-8 relative z-10">
					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<GiftIcon className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Free Membership</h3>
							<p className="contrast-text-white leading-relaxed">
								Join today and access all basic features at no cost with immediate benefits
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<ArrowPathIcon className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Weekly Activities</h3>
							<p className="contrast-text-white leading-relaxed">
								Participate in regular learning opportunities and skill-building sessions
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-4 group">
						<div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
							<UsersIcon className="w-6 h-6 text-amber-600" />
						</div>
						<div>
							<h3 className="font-bold text-lg contrast-text-white-bold">Supportive Community</h3>
							<p className="contrast-text-white leading-relaxed">
								Connect with mentors and peers who share your interests and passions
							</p>
						</div>
					</div>
				</div>

				{/* Bottom decorative gradient */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
			</div>

			{/* Right side - Register Form */}
			<div className="flex-1 flex items-center justify-center p-6 ym-features-bg relative">
				{/* Background pattern */}
				<div className="absolute inset-0 auth-pattern-bg opacity-30"></div>

				<div className="w-full max-w-md relative z-10">
					<div className="text-center mb-10">
						<div className="inline-flex items-center justify-center w-16 h-16 ym-bg-amber-400 rounded-xl mb-6 shadow-lg">
							<SparklesIcon className="w-8 h-8 text-white" />
						</div>
						<h2 className="text-3xl font-bold ym-text-primary mb-2">Create your account</h2>
						<p className="ym-text-secondary leading-relaxed">
							Join YoungMinds Club and start your journey towards personal and intellectual growth
						</p>
					</div>

					<div className="ym-bg-card rounded-2xl auth-card-shadow backdrop-blur-sm border ym-border-card overflow-hidden">
						{/* Card header with gradient */}
						<div className="h-2 gradient-bg"></div>
						<RegisterForm />
					</div>

					{/* Mobile brand info */}
					<div className="md:hidden mt-8 text-center">
						<div className="flex items-center justify-center mb-4">
							<div className="ym-bg-amber-400 p-2 rounded-lg mr-3">
								<RocketLaunchIcon className="w-5 h-5 text-white" />
							</div>
							<h3 className="text-lg font-bold ym-text-primary">YoungMinds Club</h3>
						</div>
						<p className="text-sm ym-text-muted">Your journey starts here</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
