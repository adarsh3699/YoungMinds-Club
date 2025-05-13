import { useState, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

function Navigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, isAuthenticated, isAdmin, isOrganizer, logout } = useAuth();
	const [userXP, setUserXP] = useState(null);
	const [userBadge, setUserBadge] = useState(null);

	// Fetch user profile data if logged in
	useEffect(() => {
		if (isAuthenticated) {
			const fetchUserProfile = async () => {
				try {
					const response = await axios.get('/user/dashboard');
					
					if (response.data.success && response.data.profile) {
						setUserXP(response.data.profile.xp);
						setUserBadge(response.data.profile.badge);
					}
				} catch (error) {
					console.error('Error fetching user profile:', error);
					// Don't log out on network errors
				}
			};
			
			fetchUserProfile();
		}
	}, [isAuthenticated]);

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	const userNavigation = [
		{ name: 'Dashboard', href: '/dashboard' },
		{ name: 'My Events', href: '/my-events' },
		{ name: 'Profile', href: '/user/profile' },
	];

	// Admin and organizer see additional items
	if (isAdmin) {
		userNavigation.push({ name: 'Admin Panel', href: '/admin/users' });
	} else if (isOrganizer) {
		userNavigation.push({ name: 'Organizer Panel', href: '/organizer/events' });
	}

	// Public navigation items
	const publicNavigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Events', href: '/dashboard' },
	];

	const isActiveRoute = (path) => {
		if (path === '/') {
			return location.pathname === '/';
		}
		return location.pathname.startsWith(path);
	};

	return (
		<Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50">
			{({ open }) => (
				<>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between h-16">
							<div className="flex">
								<div className="flex-shrink-0 flex items-center">
									<Link to="/" className="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-8 w-8 text-indigo-600"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">YMC Events</span>
									</Link>
								</div>
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									{publicNavigation.map((item) => (
										<Link
											key={item.name}
											to={item.href}
											className={classNames(
												isActiveRoute(item.href)
													? 'border-indigo-500 text-gray-900 dark:text-white'
													: 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
												'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
											)}
										>
											{item.name}
										</Link>
									))}
								</div>
							</div>
							<div className="hidden sm:ml-6 sm:flex sm:items-center">
								{/* User section */}
								{isAuthenticated ? (
									<div className="flex items-center">
										{/* XP Badge (desktop) */}
										{userXP !== null && userBadge && (
											<div className="mr-4 hidden md:flex items-center bg-indigo-50 dark:bg-indigo-900 px-3 py-1 rounded-full">
												<svg 
													xmlns="http://www.w3.org/2000/svg" 
													className="h-5 w-5 text-indigo-500 dark:text-indigo-300 mr-1" 
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path 
														fillRule="evenodd" 
														d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
													{userXP} XP • {userBadge}
												</span>
											</div>
										)}
										
										{/* Profile dropdown */}
										<Menu as="div" className="ml-3 relative">
											<div>
												<Menu.Button className="bg-white dark:bg-gray-700 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
													<span className="sr-only">Open user menu</span>
													<div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
														<span className="font-medium text-indigo-800 dark:text-indigo-200">
															{user?.name?.charAt(0).toUpperCase() || 'U'}
														</span>
													</div>
												</Menu.Button>
											</div>
											<Transition
												as={Fragment}
												enter="transition ease-out duration-200"
												enterFrom="transform opacity-0 scale-95"
												enterTo="transform opacity-100 scale-100"
												leave="transition ease-in duration-75"
												leaveFrom="transform opacity-100 scale-100"
												leaveTo="transform opacity-0 scale-95"
											>
												<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
													<div className="px-4 py-2 border-b dark:border-gray-700">
														<p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
														<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
													</div>
													
													{/* XP and Badge (mobile) */}
													{userXP !== null && userBadge && (
														<div className="px-4 py-2 border-b md:hidden dark:border-gray-700">
															<div className="flex items-center">
																<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
																	<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
																</svg>
																<span className="text-xs font-medium text-gray-600 dark:text-gray-300">
																	{userXP} XP
																</span>
															</div>
															<div className="flex items-center mt-1">
																<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
																	<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																</svg>
																<span className="text-xs font-medium text-gray-600 dark:text-gray-300">{userBadge}</span>
															</div>
														</div>
													)}
													
													{userNavigation.map((item) => (
														<Menu.Item key={item.name}>
															{({ active }) => (
																<Link
																	to={item.href}
																	className={classNames(
																		active ? 'bg-gray-100 dark:bg-gray-700' : '',
																		'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
																	)}
																>
																	{item.name}
																</Link>
															)}
														</Menu.Item>
													))}
													<Menu.Item>
														{({ active }) => (
															<button
																onClick={handleLogout}
																className={classNames(
																	active ? 'bg-gray-100 dark:bg-gray-700' : '',
																	'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
																)}
															>
																Logout
															</button>
														)}
													</Menu.Item>
												</Menu.Items>
											</Transition>
										</Menu>
									</div>
								) : (
									<div className="space-x-4 flex items-center">
										<Link
											to="/login"
											className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										>
											Login
										</Link>
										<Link
											to="/register"
											className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
										>
											Sign up
										</Link>
									</div>
								)}
							</div>
							<div className="-mr-2 flex items-center sm:hidden">
								{/* Mobile menu button */}
								<Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
									<span className="sr-only">Open main menu</span>
									{open ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</Disclosure.Button>
							</div>
						</div>
					</div>

					{/* Mobile menu */}
					<Disclosure.Panel className="sm:hidden">
						<div className="pt-2 pb-3 space-y-1">
							{publicNavigation.map((item) => (
								<Disclosure.Button
									key={item.name}
									as={Link}
									to={item.href}
									className={classNames(
										isActiveRoute(item.href)
											? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-100'
											: 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-white',
										'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
									)}
								>
									{item.name}
								</Disclosure.Button>
							))}
						</div>
						{isAuthenticated ? (
							<div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-center px-4">
									<div className="flex-shrink-0">
										<div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
											<span className="font-medium text-indigo-800 dark:text-indigo-200">
												{user?.name?.charAt(0).toUpperCase() || 'U'}
											</span>
										</div>
									</div>
									<div className="ml-3">
										<div className="text-base font-medium text-gray-800 dark:text-white">{user?.name}</div>
										<div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
									</div>
								</div>
								<div className="mt-3 space-y-1">
									{userNavigation.map((item) => (
										<Disclosure.Button
											key={item.name}
											as={Link}
											to={item.href}
											className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											{item.name}
										</Disclosure.Button>
									))}
									<Disclosure.Button
										as="button"
										onClick={handleLogout}
										className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										Logout
									</Disclosure.Button>
								</div>
							</div>
						) : (
							<div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
								<div className="flex flex-col space-y-2 px-4">
									<Link
										to="/login"
										className="w-full text-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										Login
									</Link>
									<Link
										to="/register"
										className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
									>
										Sign up
									</Link>
								</div>
							</div>
						)}
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}

export default Navigation;
