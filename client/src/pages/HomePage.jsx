import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
	const { isAuthenticated } = useAuth();

	return (
		<div className="bg-white">
			{/* Hero section */}
			<div className="relative bg-gradient-to-r from-blue-500 to-purple-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
					<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
						<span className="block">Welcome to</span>
						<span className="block">YoungMinds Club</span>
					</h1>
					<p className="mt-6 max-w-lg mx-auto text-xl text-blue-100">
						Connect with other young thinkers, join activities, and discover exciting learning
						opportunities.
					</p>
					<div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
						{isAuthenticated ? (
							<div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
								<Link
									to="/events"
									className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 sm:px-8"
								>
									Explore Activities
								</Link>
								<Link
									to="/dashboard"
									className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8"
								>
									Dashboard
								</Link>
							</div>
						) : (
							<div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
								<Link
									to="/register"
									className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 sm:px-8"
								>
									Get Started
								</Link>
								<Link
									to="/login"
									className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8"
								>
									Log In
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Feature section */}
			<div className="py-16 bg-gray-50 overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
						<p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
							Why Join YoungMinds Club?
						</p>
						<p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
							Everything you need to learn, grow, and connect with other young minds.
						</p>
					</div>

					<div className="mt-12">
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
							<div className="pt-6">
								<div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
									<div className="-mt-6">
										<div>
											<span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
												<svg
													className="h-6 w-6 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
													/>
												</svg>
											</span>
										</div>
										<h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
											Discover Activities
										</h3>
										<p className="mt-5 text-base text-gray-500">
											Find activities based on your interests, location, and availability. Filter
											by category, date, and type.
										</p>
									</div>
								</div>
							</div>

							<div className="pt-6">
								<div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
									<div className="-mt-6">
										<div>
											<span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
												<svg
													className="h-6 w-6 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
											</span>
										</div>
										<h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
											Learn & Grow
										</h3>
										<p className="mt-5 text-base text-gray-500">
											Access educational resources, join workshops, and develop new skills with
											our interactive programs.
										</p>
									</div>
								</div>
							</div>

							<div className="pt-6">
								<div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
									<div className="-mt-6">
										<div>
											<span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
												<svg
													className="h-6 w-6 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
													/>
												</svg>
											</span>
										</div>
										<h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
											Connect & Collaborate
										</h3>
										<p className="mt-5 text-base text-gray-500">
											Meet like-minded young people, collaborate on projects, and build lasting
											friendships.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA section */}
			<div className="bg-blue-600">
				<div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
						<span className="block">Ready to get started?</span>
						<span className="block">Join YoungMinds Club today.</span>
					</h2>
					<p className="mt-4 text-lg leading-6 text-blue-200">
						Be part of a community that values curiosity, creativity, and growth.
					</p>
					<Link
						to="/register"
						className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
					>
						Sign up for free
					</Link>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
