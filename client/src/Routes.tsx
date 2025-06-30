import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ErrorProvider } from "@/context/ErrorContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Navigation from "@/components/common/Navigation";
import Footer from "@/components/common/Footer";
import { GlobalErrorAlert, AuthRouteGuard } from "@/components/common";
import { GoogleCallback } from "@/components/auth";
import "@/styles/main.css";

// Lazy load page components
const HomePage = lazy(() => import("@/pages/home"));
const AboutPage = lazy(() => import("@/pages/About"));
const ContactPage = lazy(() => import("@/pages/Contact"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const UserDashboard = lazy(() => import("@/pages/user/dashboard"));
const UserProfile = lazy(() => import("@/pages/user/profile"));
const UserEventFeedback = lazy(() => import("@/pages/user/event-feedback"));
const OrganizerDashboard = lazy(() => import("@/pages/organizer/dashboard"));
const OrganizerProfile = lazy(() => import("@/pages/organizer/profile"));
const OrganizerSettings = lazy(() => import("@/pages/organizer/settings"));
const OrganizerManageEvent = lazy(() => import("@/pages/organizer/manage-event"));
const OrganizerManageInternship = lazy(() => import("@/pages/organizer/manage-internship"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const AdminUsersManagement = lazy(() => import("@/pages/admin/UserManagement"));
const OrganizersManagement = lazy(() => import("@/pages/admin/OrganizersManagement"));
const AdminEventsManagement = lazy(() => import("@/pages/admin/EventsManagement"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminModeration = lazy(() => import("@/pages/admin/ModerationPage"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/announcements"));
const EventDetails = lazy(() => import("@/pages/event-details"));
const EventsPage = lazy(() => import("@/pages/event-discover"));
const InternshipDetails = lazy(() => import("@/pages/internship-details"));
const InternshipsPage = lazy(() => import("@/pages/internship-discover"));
const NotFound = lazy(() => import("@/pages/not-found"));

// ScrollToTop component to handle automatic scroll to top on route change
const ScrollToTop: React.FC = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		// Use setTimeout to ensure the scroll happens after the component renders
		setTimeout(() => {
			// Scroll the main window
			window.scrollTo({ top: 0, left: 0, behavior: "instant" });

			// Also scroll any potential scroll containers
			const mainElement = document.querySelector("main");
			if (mainElement) {
				mainElement.scrollTop = 0;
			}

			// Scroll the document element as fallback
			document.documentElement.scrollTop = 0;
			document.body.scrollTop = 0;
		}, 0);
	}, [pathname]);

	return null;
};

// Dashboard router component that routes to the appropriate dashboard based on user role
const DashboardRouter: React.FC = () => {
	const { user, isAdmin, isOrganizer, loading, token } = useAuth();

	// If still loading and we have a token, don't redirect yet
	if (loading && token) {
		return (
			<div className="flex flex-col justify-center items-center h-[70vh]">
				<div
					className="w-16 h-16 border-t-4 border-solid rounded-full animate-spin mb-4"
					style={{ borderTopColor: "var(--ring)" }}
				></div>
				<h2 className="text-xl font-semibold ym-text-primary">Loading</h2>
			</div>
		);
	}

	// Only redirect to login if we're sure the user is not authenticated
	if (!user && !loading) return <Navigate to="/login" />;

	if (isAdmin) {
		return <Navigate to="/admin/dashboard" />;
	} else if (isOrganizer) {
		return <Navigate to="/organizer/dashboard" />;
	} else {
		return <Navigate to="/user/dashboard" />;
	}
};

const AppRoutes: React.FC = () => {
	return (
		<ErrorProvider>
			<AuthProvider>
				<Router>
					{/* Scroll to top on route change */}
					<ScrollToTop />

					{/* Global Error Alert */}
					<GlobalErrorAlert />

					<div className="min-h-screen flex flex-col ym-bg-card">
						<Navigation />
						<main className="flex-grow flex flex-col min-h-screen" style={{ minHeight: "calc(100vh)" }}>
							<Suspense
								fallback={
									<div className="flex flex-col justify-center items-center h-[70vh]">
										<div
											className="w-16 h-16 border-t-4 border-solid rounded-full animate-spin mb-4"
											style={{ borderTopColor: "var(--ring)" }}
										></div>
										<h2 className="text-xl font-semibold ym-text-primary">Loading</h2>
									</div>
								}
							>
								<div className="min-h-[calc(100vh-80px)]">
									<Routes>
										{/* Public routes */}
										<Route path="/" element={<HomePage />} />
										<Route path="/about" element={<AboutPage />} />
										<Route path="/contact" element={<ContactPage />} />
										<Route
											path="/login"
											element={
												<AuthRouteGuard>
													<LoginPage />
												</AuthRouteGuard>
											}
										/>
										<Route
											path="/register"
											element={
												<AuthRouteGuard>
													<RegisterPage />
												</AuthRouteGuard>
											}
										/>
										<Route path="/event/:id" element={<EventDetails />} />
										<Route path="/events" element={<EventsPage />} />
										<Route path="/internship/:id" element={<InternshipDetails />} />
										<Route path="/internships" element={<InternshipsPage />} />
										<Route path="/internship-discover" element={<InternshipsPage />} />

										{/* Google OAuth routes */}
										<Route path="/auth/success" element={<GoogleCallback />} />
										<Route path="/auth/error" element={<NotFound />} />

										{/* Dashboard redirector route */}
										<Route path="/dashboard" element={<DashboardRouter />} />

										{/* User routes */}
										<Route element={<ProtectedRoute requiredRole="user" />}>
											<Route path="/user/dashboard" element={<UserDashboard />} />
											<Route path="/user/profile" element={<UserProfile />} />
											<Route path="/event/:id/feedback" element={<UserEventFeedback />} />
										</Route>

										{/* Admin routes */}
										<Route element={<ProtectedRoute requiredRole="admin" />}>
											<Route path="/admin/dashboard" element={<AdminDashboard />} />
											<Route path="/admin/profile" element={<AdminProfile />} />
											<Route path="/admin/users" element={<AdminUsersManagement />} />
											<Route path="/admin/organizers" element={<OrganizersManagement />} />
											<Route path="/admin/events" element={<AdminEventsManagement />} />
											<Route path="/admin/analytics" element={<AdminAnalytics />} />
											<Route path="/admin/moderation" element={<AdminModeration />} />
											<Route path="/admin/announcements" element={<AdminAnnouncements />} />
										</Route>

										{/* Organizer routes */}
										<Route element={<ProtectedRoute requiredRole={["organizer", "admin"]} />}>
											<Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
											<Route path="/organizer/profile" element={<OrganizerProfile />} />
											<Route path="/organizer/settings" element={<OrganizerSettings />} />
											<Route path="/organizer/event/:id" element={<OrganizerManageEvent />} />
											<Route
												path="/organizer/internship/:id"
												element={<OrganizerManageInternship />}
											/>
										</Route>

										{/* Fallback route */}
										<Route path="*" element={<NotFound />} />
									</Routes>
								</div>
							</Suspense>
						</main>
						<Footer />
					</div>
				</Router>
			</AuthProvider>
		</ErrorProvider>
	);
};

export default AppRoutes;
