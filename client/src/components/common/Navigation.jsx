import { useState, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
		if (isAuthenticated && !isOrganizer) {
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
	}, [isAuthenticated, isOrganizer]);

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	// Generate user navigation items based on role
	let userNavigation = [];

	// Add role-specific profile link and items
	if (isAdmin) {
		userNavigation.push({ name: 'Dashboard', href: '/dashboard' });
		userNavigation.push({ name: 'Profile', href: '/admin/profile' });
		userNavigation.push({ name: 'Admin Panel', href: '/admin/users' });
	} else if (isOrganizer) {
		userNavigation.push({ name: 'Profile', href: '/organizer/profile' });
		userNavigation.push({ name: 'Settings', href: '/organizer/settings' });
	} else {
		userNavigation.push({ name: 'Dashboard', href: '/dashboard' });
		userNavigation.push({ name: 'Profile', href: '/user/profile' });
	}

	// Public navigation items
	const publicNavigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Events', href: '/events' },
	];

	// Add Dashboard to navbar for organizers and admins
	if (isAdmin) {
		publicNavigation.push({ name: 'Dashboard', href: '/admin/dashboard' });
	} else if (isOrganizer) {
		publicNavigation.push({ name: 'Dashboard', href: '/organizer/dashboard' });
	}

	const isActiveRoute = (path) => {
		if (path === '/') {
			return location.pathname === '/';
		}
		return location.pathname.startsWith(path);
	};

	return (
		<Disclosure as="nav" className="ym-bg-card shadow-sm fixed w-full top-0 z-50 border-b ym-border-card">
			{({ open }) => (
				<>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between h-16">
							<div className="flex">
								<div className="flex-shrink-0 flex items-center">
									<Link to="/" className="flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-8 w-8 ym-text-yellow-600"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="ml-2 text-xl font-bold ym-text-primary">YMs Club</span>
									</Link>
								</div>
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									{publicNavigation.map((item) => (
										<Link
											key={item.name}
											to={item.href}
											className={classNames(
												isActiveRoute(item.href)
													? 'border-amber-500 ym-text-primary'
													: 'border-transparent ym-text-secondary hover:border-amber-300 hover:ym-text-primary',
												'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
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
										{userXP !== null && userBadge && !isOrganizer && (
											<div className="mr-4 hidden md:flex items-center ym-bg-yellow-100 px-3 py-1 rounded-full">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-5 w-5 ym-text-yellow-600 mr-1"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fillRule="evenodd"
														d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span className="text-sm font-medium ym-text-yellow-700">
													{userXP} XP • {userBadge}
												</span>
											</div>
										)}

										{/* Profile dropdown */}
										<Menu as="div" className="ml-3 relative">
											<div>
												<Menu.Button className="ym-bg-card flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 border ym-border-card">
													<span className="sr-only">Open user menu</span>
													<div className="h-8 w-8 rounded-full ym-bg-yellow-100 flex items-center justify-center">
														<span className="font-medium ym-text-yellow-700">
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
												<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ym-bg-card ring-1 ring-black ring-opacity-5 focus:outline-none border ym-border-card">
													<div className="px-4 py-2 border-b ym-border-card">
														<p className="text-sm font-medium ym-text-primary truncate">
															{user?.name}
														</p>
														<p className="text-xs ym-text-muted truncate">{user?.email}</p>
													</div>

													{/* XP and Badge (mobile) */}
													{userXP !== null && userBadge && !isOrganizer && (
														<div className="px-4 py-2 border-b md:hidden ym-border-card">
															<div className="flex items-center">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-4 w-4 ym-text-yellow-600 mr-1"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																>
																	<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
																</svg>
																<span className="text-xs font-medium ym-text-secondary">
																	{userXP} XP
																</span>
															</div>
															<div className="flex items-center mt-1">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	className="h-4 w-4 ym-text-yellow-600 mr-1"
																	viewBox="0 0 20 20"
																	fill="currentColor"
																>
																	<path
																		fillRule="evenodd"
																		d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																		clipRule="evenodd"
																	/>
																</svg>
																<span className="text-xs font-medium ym-text-secondary">
																	{userBadge}
																</span>
															</div>
														</div>
													)}

													{userNavigation.map((item) => (
														<Menu.Item key={item.name}>
															{({ active }) => (
																<Link
																	to={item.href}
																	className={classNames(
																		active ? 'ym-bg-card-hover' : '',
																		'block px-4 py-2 text-sm ym-text-card transition-colors'
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
																	active ? 'ym-bg-card-hover' : '',
																	'block w-full text-left px-4 py-2 text-sm ym-text-card transition-colors'
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
											className="inline-flex items-center px-4 py-2 border ym-border-card rounded-md shadow-sm text-sm font-medium ym-text-card ym-bg-card hover:ym-bg-card-hover transition-colors"
										>
											Login
										</Link>
										<Link
											to="/register"
											className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ym-text-white gradient-bg hover:shadow-lg transition-all"
										>
											Sign up
										</Link>
									</div>
								)}
							</div>
							<div className="-mr-2 flex items-center sm:hidden">
								{/* Mobile menu button */}
								<Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md ym-text-muted hover:ym-text-primary hover:ym-bg-card-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 transition-colors">
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
											? 'ym-bg-yellow-100 border-amber-500 ym-text-yellow-700'
											: 'border-transparent ym-text-secondary hover:ym-bg-card-hover hover:border-amber-300 hover:ym-text-primary',
										'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors'
									)}
								>
									{item.name}
								</Disclosure.Button>
							))}
						</div>
						{isAuthenticated ? (
							<div className="pt-4 pb-3 border-t ym-border-card">
								<div className="flex items-center px-4">
									<div className="flex-shrink-0">
										<div className="h-10 w-10 rounded-full ym-bg-yellow-100 flex items-center justify-center">
											<span className="font-medium ym-text-yellow-700">
												{user?.name?.charAt(0).toUpperCase() || 'U'}
											</span>
										</div>
									</div>
									<div className="ml-3">
										<div className="text-base font-medium ym-text-primary">{user?.name}</div>
										<div className="text-sm font-medium ym-text-muted">{user?.email}</div>
									</div>
								</div>
								<div className="mt-3 space-y-1">
									{userNavigation.map((item) => (
										<Disclosure.Button
											key={item.name}
											as={Link}
											to={item.href}
											className="block px-4 py-2 text-base font-medium ym-text-secondary hover:ym-text-primary hover:ym-bg-card-hover transition-colors"
										>
											{item.name}
										</Disclosure.Button>
									))}
									<Disclosure.Button
										as="button"
										onClick={handleLogout}
										className="block w-full text-left px-4 py-2 text-base font-medium ym-text-secondary hover:ym-text-primary hover:ym-bg-card-hover transition-colors"
									>
										Logout
									</Disclosure.Button>
								</div>
							</div>
						) : (
							<div className="pt-4 pb-3 border-t ym-border-card">
								<div className="space-y-2 px-4">
									<Link
										to="/login"
										className="w-full text-center py-2 px-4 border ym-border-card rounded-md shadow-sm text-sm font-medium ym-text-card ym-bg-card hover:ym-bg-card-hover transition-colors"
									>
										Login
									</Link>
									<Link
										to="/register"
										className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ym-text-white gradient-bg hover:shadow-lg transition-all block"
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
