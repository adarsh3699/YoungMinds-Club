import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CTASection = () => {
	const { isAuthenticated } = useAuth();

	return (
		<section className="gradient-bg">
			<div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
				<h2 className="text-3xl font-extrabold ym-text-white sm:text-4xl">
					<span className="block">Ready to get started?</span>
					<span className="block">Join YoungMinds Club today.</span>
				</h2>
				<p className="mt-4 text-lg leading-6 ym-text-white-90">
					Be part of a community that values curiosity, creativity, and growth.
				</p>
				{!isAuthenticated && (
					<Link
						to="/register"
						className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg ym-btn-secondary hover:ym-bg-card-hover shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
					>
						Sign up for free
						<ChevronRightIcon className="w-5 h-5 ml-2" />
					</Link>
				)}
			</div>
		</section>
	);
};

export default CTASection;
