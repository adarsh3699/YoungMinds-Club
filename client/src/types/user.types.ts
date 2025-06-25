import type { User } from './core.types';
import type { EventCardData } from './events.types';

// User Component Types
export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  college?: string;
  profilePicture?: string;
  badge?: string;
  xp?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BadgeInfo {
  icon: React.ReactNode;
  color: string;
}

export interface BadgeItem {
  _id?: string;
  name: string;
  description?: string;
  unlocked?: boolean;
  earnedDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface XPLevel {
  name: string;
  min: number;
  max: number;
}

export interface XPHistoryEntry {
  _id?: string;
  date: string;
  description: string;
  amount: number;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  college: string;
}

// User Component Props
export interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  editMode: boolean;
  formValues: ProfileFormValues;
  saving: boolean;
  onToggleEditMode: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getBadgeInfo: (badgeName: string) => BadgeInfo;
}

export interface BadgeCollectionProps {
  badges: BadgeItem[] | null;
  getBadgeInfo: (badgeName: string) => BadgeInfo;
}

export interface XPProgressBarProps {
  xp: number;
}

export interface XPSectionProps {
  userProfile: UserProfile | null;
  xpHistory: XPHistoryEntry[] | null;
}

// User Dashboard Page Types
export interface UserDashboardProfile {
  badge: string;
  xp: number;
  streakCount?: number;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  expiresAt?: string;
}

export interface DashboardEventFilters {
  searchQuery: string;
  category: string;
  city: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  tag: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  events: EventCardData[];
}

export interface UserDashboardApiResponse {
  success: boolean;
  profile: UserDashboardProfile;
  events: EventCardData[];
  recommendedEvents: EventCardData[];
  announcements: Announcement[];
  currentPage: number;
  totalPages: number;
  message?: string;
}

export interface RecommendedEventsApiResponse {
  success: boolean;
  events: EventCardData[];
  message?: string;
}

// Badge and XP Types
export interface DashboardBadgeInfo {
  color: string;
  icon: string;
}

export type BadgeType = 'Newbie' | 'Regular' | 'Champ' | 'Veteran' | 'Master';
export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';

// User Dashboard Component Props
export type UserDashboardProps = object;

// Event Handler Types for UserDashboard
export interface UserDashboardHandlers {
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  handleResetFilters: () => void;
  handlePageChange: (newPage: number) => void;
  handleSaveToggle: (eventId: string, isSaved: boolean) => void;
  getBadgeInfo: (badgeName: string) => DashboardBadgeInfo;
  getAnnouncementStyle: (type: AnnouncementType) => string;
}

// Event Feedback Types
export interface EventFeedbackData {
  id: string;
  title: string;
  poster: string;
  date: string;
  organizer: {
    name: string;
  };
}

export interface FeedbackFormData {
  rating: number;
  comment: string;
}

export interface FeedbackApiResponse {
  success: boolean;
  message?: string;
  xp?: number;
}

export interface UserEventRegistration {
  id: string;
  feedback?: {
    given: boolean;
  };
}

export interface UserEventsApiResponse {
  success: boolean;
  registeredEvents: UserEventRegistration[];
}

// User Management Types (for admin use)
export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  status?: 'active' | 'suspended';
  isFlagged?: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // Allow additional properties for SearchAndFilter compatibility
}

export interface UserModalState {
  isOpen: boolean;
  type: 'delete' | 'status' | 'flag' | null;
  userId: string | null;
  userName: string;
  deleteAllData: boolean;
  currentStatus: string;
  isFlagged: boolean;
  flagReason: string;
}

export interface StatusBadgeStyle {
  className: string;
  icon: React.ReactNode;
  text: string;
}

export interface UserRowProps {
  userData: UserData;
  index: number;
  user: User | null;
  onRoleChange: (userId: string, newRole: string) => void;
  onStatusChange: (userId: string, userName: string, status: string) => void;
  onFlag: (userId: string, userName: string, isFlagged: boolean, flagReason?: string) => void;
  onDelete: (userId: string, userName: string) => void;
  isInitialLoad: boolean;
}

export interface UsersApiResponse {
  success: boolean;
  users: UserData[];
}

export interface UserRoleUpdateResponse {
  success: boolean;
}

export interface UserStatusUpdateResponse {
  success: boolean;
}

export interface UserFlagUpdateResponse {
  success: boolean;
}

export interface UserDeleteResponse {
  success: boolean;
}

// User Card Data
export interface UserCardData {
  _id?: string;
  name: string;
  profilePicture?: string;
  badge?: string;
  xp?: number;
  eventsAttended?: number;
  eventsCount?: number;
  organizationName?: string;
  rating?: number;
  lastActive?: string;
}

export interface UserCardProps {
  user: UserCardData;
  index: number;
  type?: 'user' | 'organizer';
}

// Organizer Application Types (user-side)
export interface OrganizerApplicationData {
  organizationName: string;
  socialLinks?: string;
  reason: string;
  experience: string;
}

export interface OrganizerApplicationProps {
  applyingForOrganizer: boolean;
  organizerApplication: OrganizerApplicationData;
  saving: boolean;
  onApplicationChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmitApplication: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleApplication: () => void;
} 