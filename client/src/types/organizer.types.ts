import React from 'react';
import type { FilterOption } from './ui-components.types';

// Organizer Dashboard Types
export interface OrganizerDashboardData {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  upcomingEvents: number;
  totalInternships?: number;
  totalInternshipApplications?: number;
  upcomingInternships?: number;
}

export interface OrganizerEvent {
  _id: string;
  title: string;
  date: string;
  status: 'draft' | 'published' | 'cancelled';
  registrationCount: number;
  maxParticipants?: number;
  poster?: string;
  description?: string;
  location?: string;
  price?: number;
}

export interface OrganizerFeedbackSummary {
  averageRating: number;
  totalFeedbacks: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// FilterOption is imported from ui-components.types.ts

export interface OrganizerDashboardApiResponse {
  success: boolean;
  data: OrganizerDashboardData;
}

export interface OrganizerEventsApiResponse {
  success: boolean;
  events: OrganizerEvent[];
}

export interface OrganizerFeedbackApiResponse {
  success: boolean;
  summary: OrganizerFeedbackSummary;
}

// Organizer Dashboard Component Props
export interface DashboardOverviewProps {
  type?: 'events' | 'internships';
  onCreateAction: any;
  title?: any;
  subtitle?: any;
  buttonText?: any;
  // Direct data props for events
  totalEvents?: number;
  totalRegistrations?: number;
  upcomingEvents?: number;
  averageRating?: string | number;
  // Direct data props for internships
  totalInternships?: number;
  totalApplications?: number;
  activeInternships?: number;
  avgApplications?: number;
}

export interface EventRegistrationChartProps {
  events: OrganizerEvent[];
}

export interface FeedbackSummaryProps {
  feedbackSummary: OrganizerFeedbackSummary | null;
}

export interface EventsListProps {
  events: OrganizerEvent[];
  eventFilter: string;
  setEventFilter: (filter: string) => void;
  filterOptions: FilterOption[];
  onCreateEvent: () => void;
}

// Organizer Settings Types
export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  publicProfile: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
}

export interface OrganizerSettings {
  privacy: PrivacySettings;
  security: SecuritySettings;
}

export interface MessageState {
  type: 'success' | 'error' | '';
  text: string;
}

export interface OrganizerSettingsApiResponse {
  success: boolean;
  settings: OrganizerSettings;
}

// Organizer Manage Event Types
export interface ManageEventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: {
    type: 'online' | 'offline';
    venue?: string;
    address?: string;
    city?: string;
    onlineUrl?: string;
  };
  category: string;
  type: string;
  price: number;
  poster: string;
  registrationCount: number;
  capacity: number;
  tags?: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeData {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  registrationDate: string;
  status: 'registered' | 'attended';
  hasFeedback: boolean;
}

export interface EventManageApiResponse {
  success: boolean;
  event: ManageEventData;
}

export interface AttendeesApiResponse {
  success: boolean;
  attendees: AttendeeData[];
}

// Organizer Profile Types
export interface SocialLinks {
  [key: string]: string | undefined;
  website?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

export interface OrganizerProfileData {
  _id?: string;
  name: string;
  organizationName?: string;
  bio?: string;
  email: string;
  organizerBrandLogo?: string;
  socialLinks?: SocialLinks;
  rating?: number;
  totalEvents?: number;
  totalRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerFormValues {
  name: string;
  organizationName: string;
  bio: string;
  email: string;
  socialLinks: SocialLinks;
}

export interface OrganizerProfileApiResponse {
  success: boolean;
  profile: OrganizerProfileData;
}

export interface OrganizerProfilePictureResponse {
  success: boolean;
  organizerBrandLogo: string;
}

// Organizers Management Types (for admin use)
export interface OrganizerData {
  _id: string;
  name: string;
  email: string;
  organizationName?: string;
  role: 'organizer';
  status?: 'active' | 'suspended';
  isFlagged?: boolean;
  flagReason?: string | null;
  eventCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // Allow additional properties for SearchAndFilter compatibility
}

export interface OrganizerModalState {
  isOpen: boolean;
  type: 'status' | 'flag' | 'demote' | null;
  organizerId: string | null;
  organizerName: string;
  currentStatus: string;
  isFlagged: boolean;
  flagReason: string;
}

export interface OrganizersApiResponse {
  success: boolean;
  organizers: OrganizerData[];
  message?: string;
}

export interface OrganizerStatsCardData {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
}

export interface OrganizerInternship {
  _id: string;
  title: string;
  companyName: string;
  applicationDeadline: string;
  status: 'draft' | 'published' | 'closed';
  applicationCount: number;
  poster?: string;
  description?: string;
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  compensation: {
    type: 'Paid' | 'Unpaid';
    amount?: number;
    currency?: string;
  };
  duration: string;
  type: string;
  category: string;
}

export interface OrganizerInternshipsApiResponse {
  success: boolean;
  internships: OrganizerInternship[];
}

export interface InternshipsListProps {
  internships: OrganizerInternship[];
  internshipFilter: string;
  setInternshipFilter: (filter: string) => void;
  filterOptions: FilterOption[];
  onCreateInternship: () => void;
} 