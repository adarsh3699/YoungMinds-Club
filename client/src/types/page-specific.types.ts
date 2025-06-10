import type { User, Event, Booking } from './core.types';

// Dashboard Types
export interface DashboardStats {
  totalEvents?: number;
  upcomingEvents?: number;
  totalAttendees?: number;
  totalRevenue?: number;
  totalUsers?: number;
  totalOrganizers?: number;
  recentBookings?: Booking[];
  popularEvents?: Event[];
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
}

// User Profile API Response for Navigation
export interface UserProfileResponse {
  success: boolean;
  message?: string;
  profile?: {
    xp: number;
    badge: string;
  };
}

// Navigation Props (no props needed for this component)
export interface NavigationProps {}

// ClassNames utility function type
export type ClassNamesFunction = (...classes: (string | boolean | undefined | null)[]) => string;

// Auth Component Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'organizer';
}

export interface AuthFormErrors {
  [key: string]: string;
}

export interface LoginFormProps {}

export interface RegisterFormProps {}

export interface SocialLoginProps {}

export interface GoogleCallbackProps {}

// Auth API Response Types
export interface AuthMeResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Role Option for RegisterForm
export interface RoleOption {
  value: 'user' | 'organizer';
  label: string;
}

// Home Component Types
export interface StatItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color: string;
}

export interface FeaturedEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  price: string;
  type: string;
  gradient: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HeroSectionProps {}

export interface FeaturesSectionProps {}

export interface EventsSectionProps {}

export interface FAQSectionProps {}

export interface CTASectionProps {}

// Contact Form Types
export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactProps {} 