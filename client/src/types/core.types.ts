// User Types
export interface User {
	_id: string;
	email: string;
	name: string;
	role: "user" | "organizer" | "admin";
	status?: "active" | "suspended";
	organizerStatus?: "none" | "pending" | "approved" | "rejected";
	organizerApplication?: {
		organizationName?: string;
		reason?: string;
		experience?: string;
		socialLinks?: string;
		appliedAt?: string;
		reviewedAt?: string;
		reviewedBy?: string;
		rejectionReason?: string;
		reapplicationCount?: number;
		lastRejectedAt?: string;
	};
	profileImage?: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	bio?: string;
	interests?: string[];
	createdAt: string;
	updatedAt: string;
}

// Event Types
export interface Event {
	_id: string;
	title: string;
	description: string;
	eventDate: string;
	startTime: string;
	endTime: string;
	location: string;
	venue: string;
	category: string;
	maxAttendees: number;
	currentAttendees: number;
	ticketPrice: number;
	eventImage?: string;
	status: "draft" | "published" | "cancelled" | "completed";
	organizer: User | string;
	attendees: User[] | string[];
	tags?: string[];
	requirements?: string[];
	createdAt: string;
	updatedAt: string;
}

// Booking/Ticket Types
export interface Booking {
	_id: string;
	event: Event | string;
	user: User | string;
	bookingDate: string;
	status: "booked" | "cancelled" | "attended";
	qrCode?: string;
	ticketNumber: string;
	createdAt: string;
	updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	token?: string;
	user?: User;
	errors?: ValidationError[];
}

export interface ValidationError {
	msg: string;
	param: string;
	location: string;
}

// Auth Context Types
export interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	error: string | null;
	register: (userData: RegisterData) => Promise<ApiResponse>;
	login: (userData: LoginData) => Promise<ApiResponse>;
	logout: () => Promise<void>;
	forgotPassword: (email: string) => Promise<ApiResponse>;
	resetPassword: (data: { token: string; password: string }) => Promise<ApiResponse>;
	setToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	updateUserInfo?: (userInfo: { name: string; email: string }) => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isOrganizer: boolean;
}

// Error Context Types
export interface ErrorContextType {
	error: string | null;
	showError: (errorMessage: string) => void;
	clearError: () => void;
}

// Form Data Types (needed for AuthContextType)
export interface RegisterData {
	name: string;
	email: string;
	password: string;
	confirmPassword?: string;
	role?: "user" | "organizer";
	// Organizer application fields
	organizationName?: string;
	socialLinks?: string;
	reason?: string;
	experience?: string;
}

export interface LoginData {
	email: string;
	password: string;
}
