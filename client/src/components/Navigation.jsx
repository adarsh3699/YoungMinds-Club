import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
	const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();

	return (
		<nav className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link to="/" className="text-2xl font-bold text-blue-600">
								YoungMinds Club
							</Link>
						</div>

						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							<Link
								to="/"
								className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
							>
								Home
							</Link>

							<Link
								to="/events"
								className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
							>
								Events
							</Link>

							{isAuthenticated && (
								<Link
									to="/dashboard"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
								>
									Dashboard
								</Link>
							)}

							{isOrganizer && (
								<Link
									to="/organizer/events"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
								>
									Manage Events
								</Link>
							)}

							{isAdmin && (
								<Link
									to="/admin/users"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
								>
									Manage Users
								</Link>
							)}
						</div>
					</div>

					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						{isAuthenticated ? (
							<div className="flex items-center">
								<span className="mr-4 text-sm text-gray-500">Hi, {user?.name}</span>
								<button
									onClick={logout}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex space-x-4">
								<Link
									to="/login"
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
								>
									Log in
								</Link>
								<Link
									to="/register"
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
								>
									Sign up
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center sm:hidden">
						<button
							type="button"
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							{/* Icon for menu */}
							<svg
								className="block h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu, show/hide based on menu state */}
			<div className="sm:hidden hidden">
				<div className="pt-2 pb-3 space-y-1">
					<Link
						to="/"
						className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
					>
						Home
					</Link>

					<Link
						to="/events"
						className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
					>
						Events
					</Link>

					{isAuthenticated && (
						<Link
							to="/dashboard"
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
						>
							Dashboard
						</Link>
					)}

					{isOrganizer && (
						<Link
							to="/organizer/events"
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
						>
							Manage Events
						</Link>
					)}

					{isAdmin && (
						<Link
							to="/admin/users"
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
						>
							Manage Users
						</Link>
					)}
				</div>

				<div className="pt-4 pb-3 border-t border-gray-200">
					{isAuthenticated ? (
						<div>
							<div className="flex items-center px-4">
								<div className="flex-shrink-0">
									<img
										className="h-10 w-10 rounded-full"
										src={user?.profilePicture || 'https://via.placeholder.com/40'}
										alt={user?.name}
									/>
								</div>
								<div className="ml-3">
									<div className="text-base font-medium text-gray-800">{user?.name}</div>
									<div className="text-sm font-medium text-gray-500">{user?.email}</div>
								</div>
							</div>
							<div className="mt-3 space-y-1">
								<button
									onClick={logout}
									className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
								>
									Logout
								</button>
							</div>
						</div>
					) : (
						<div className="flex flex-col space-y-2 px-4">
							<Link
								to="/login"
								className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
							>
								Log in
							</Link>
							<Link
								to="/register"
								className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
