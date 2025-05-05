import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navigation = () => {
	const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<nav className="bg-white bg-opacity-95 backdrop-blur-sm shadow-lg fixed top-0 left-0 right-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<div className="flex-shrink-0 flex items-center">
							<Link to="/" className="flex items-center">
								<div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-2 flex items-center justify-center text-white font-bold text-lg select-none">
									YM
								</div>
								<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">
									YoungMinds Club
								</span>
							</Link>
						</div>

						<div className="hidden md:ml-10 md:flex md:space-x-8">
							<Link
								to="/"
								className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 select-none"
							>
								Home
							</Link>

							<Link
								to="/events"
								className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 select-none"
							>
								Events
							</Link>

							{isAuthenticated && (
								<Link
									to="/dashboard"
									className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 select-none"
								>
									Dashboard
								</Link>
							)}

							{isOrganizer && (
								<Link
									to="/organizer/events"
									className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 select-none"
								>
									Manage Events
								</Link>
							)}

							{isAdmin && (
								<Link
									to="/admin/users"
									className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600 select-none"
								>
									Manage Users
								</Link>
							)}
						</div>
					</div>

					<div className="hidden md:flex md:items-center">
						{isAuthenticated ? (
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold select-none">
										{user?.name?.charAt(0)?.toUpperCase() || 'U'}
									</div>
									<span className="text-sm font-medium text-gray-700 select-none">
										Hi, {user?.name}
									</span>
								</div>
								<button
									onClick={logout}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm transition-all select-none"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex space-x-4">
								<Link
									to="/login"
									className="inline-flex items-center px-4 py-2 border border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors select-none"
								>
									Log in
								</Link>
								<Link
									to="/register"
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all select-none"
								>
									Sign up
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center md:hidden">
						<button
							type="button"
							onClick={toggleMobileMenu}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
							aria-expanded={mobileMenuOpen}
						>
							<span className="sr-only select-none">Open main menu</span>
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
			<div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
				<div className="pt-2 pb-3 space-y-1 border-t border-gray-200">
					<Link
						to="/"
						onClick={toggleMobileMenu}
						className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors select-none"
					>
						Home
					</Link>

					<Link
						to="/events"
						onClick={toggleMobileMenu}
						className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors select-none"
					>
						Events
					</Link>

					{isAuthenticated && (
						<Link
							to="/dashboard"
							onClick={toggleMobileMenu}
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors select-none"
						>
							Dashboard
						</Link>
					)}

					{isOrganizer && (
						<Link
							to="/organizer/events"
							onClick={toggleMobileMenu}
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors select-none"
						>
							Manage Events
						</Link>
					)}

					{isAdmin && (
						<Link
							to="/admin/users"
							onClick={toggleMobileMenu}
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-colors select-none"
						>
							Manage Users
						</Link>
					)}
				</div>

				<div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
					{isAuthenticated ? (
						<div>
							<div className="flex items-center px-4 py-2">
								<div className="flex-shrink-0">
									<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg select-none">
										{user?.name?.charAt(0)?.toUpperCase() || 'U'}
									</div>
								</div>
								<div className="ml-3">
									<div className="text-base font-medium text-gray-800 select-none">{user?.name}</div>
									<div className="text-sm font-medium text-gray-500 select-none">{user?.email}</div>
								</div>
							</div>
							<div className="mt-3 space-y-1 px-2">
								<button
									onClick={() => {
										logout();
										toggleMobileMenu();
									}}
									className="block w-full text-center py-2 px-4 text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700 transition-all select-none"
								>
									Logout
								</button>
							</div>
						</div>
					) : (
						<div className="flex flex-col space-y-2 px-4">
							<Link
								to="/login"
								onClick={toggleMobileMenu}
								className="block text-center px-4 py-2 border border-blue-500 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors select-none"
							>
								Log in
							</Link>
							<Link
								to="/register"
								onClick={toggleMobileMenu}
								className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all select-none"
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
