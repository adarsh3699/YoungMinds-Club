import type { UserCardData } from './user.types';

// Admin Component Types
export interface AdminPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  backLink?: string;
  backText?: string;
  iconBgColor?: string;
}

export interface AdminConfirmationModalProps {
  modalType: 'delete' | 'status' | 'flag' | 'demote';
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  deleteAllData?: boolean;
  onToggleDeleteAllData?: () => void;
  currentStatus?: string;
  isFlagged?: boolean;
  flagReason?: string;
  onFlagReasonChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onConfirm: () => void;
  context?: 'user' | 'event' | 'internship';
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface AdminRoleOption {
  value: string;
  label: string;
}

export interface ModalConfiguration {
  title?: string;
  iconBg: string;
  headerTitle?: string;
  baseMessage?: string;
  message?: string;
  confirmText?: string;
  confirmClass: string;
  getIcon?: () => React.ReactNode;
  getConfig?: (param: boolean) => {
    title: string;
    headerTitle: string;
    message: string;
    confirmText: string;
    confirmClass?: string;
  };
  getConfirmText?: (param: boolean) => string;
}

// Stats Card Props
export interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
}

// Loading Component Props
export type LoadingComponentProps = Record<string, never>;

// Admin Table Header Configuration
export interface AdminTableColumn {
  key: string;
  label: string;
  className?: string;
}

// Admin Table Props (formerly UsersTableProps)
export interface AdminTableProps {
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredItems: any[];
  searchTerm: string;
  roleFilter?: string;
  statusFilter: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderRow: (item: any, index: number) => React.ReactNode;
  columns: AdminTableColumn[];
  emptyStateConfig?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    noFiltersDescription: string;
  };
  className?: string;
  'aria-label'?: string;
}

// Empty State Props
export interface EmptyStateProps {
  hasFilters: boolean;
  emptyStateConfig?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    noFiltersDescription: string;
  };
  colSpan: number;
}

// Table Header Props
export interface TableHeaderProps {
  columns: AdminTableColumn[];
}

// Loading Spinner Props  
export interface LoadingSpinnerProps {
  loadingText?: string;
}

// Backward compatibility - deprecated, use AdminTableProps instead
export interface UsersTableProps {
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredUsers: any[];
  searchTerm: string;
  roleFilter?: string;
  statusFilter: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderUserRow: (userData: any, index: number) => React.ReactNode;
}

// Admin Section Card Props
export interface AdminSectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

// Admin Section Data for cards
export interface AdminSection {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  count?: number;
}

// Updated Admin Section Card Props with proper section interface
export interface AdminSectionCardComponentProps {
  section: AdminSection;
}

// User Stats Cards Props
export interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
  loading?: boolean;
}

// User Stats Data interface
export interface UserStatsData {
  total: number;
  active: number;
  suspended: number;
  flagged: number;
  admins: number;
  organizers: number;
  regularUsers: number;
}

// Updated User Stats Cards Props with proper data interface
export interface UserStatsCardsComponentProps {
  userStats: UserStatsData;
}

// Stat Card Props for internal component
export interface StatCardProps {
  value: number;
  label: string;
  color?: string;
  delay: string;
}

// Announcement Form Props
export interface AnnouncementFormProps {
  onSubmit?: (announcement: AnnouncementData) => void;
  loading?: boolean;
}

export interface AnnouncementData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'users' | 'organizers' | 'admins';
  expiresAt?: string;
}

// Updated Announcement Form Props for the actual component
export interface AnnouncementFormComponentProps {
  showForm: boolean;
  onToggleForm: () => void;
}

// Announcement Form State
export interface AnnouncementFormState {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'users' | 'organizers';
}

// Select Option Types for Announcement Form
export interface AnnouncementTypeOption {
  value: 'info' | 'success' | 'warning' | 'error';
  label: string;
}

export interface TargetAudienceOption {
  value: 'all' | 'users' | 'organizers';
  label: string;
}

// Top Organizers Props
export interface TopOrganizersProps {
  organizers?: UserCardData[];
  loading?: boolean;
}

// Active Users Props  
export interface ActiveUsersProps {
  users?: UserCardData[];
  loading?: boolean;
}

// Admin Dashboard Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalRegistrations: number;
  flaggedItems: number;
}

export interface AdminAnnouncementForm {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'users' | 'organizers';
}

export interface AdminStatsApiResponse {
  success: boolean;
  stats: AdminDashboardStats;
}

export interface AdminTopOrganizersApiResponse {
  success: boolean;
  organizers: UserCardData[];
}

export interface AdminActiveUsersApiResponse {
  success: boolean;
  users: UserCardData[];
}

export interface AdminAnnouncementApiResponse {
  success: boolean;
  message?: string;
}

// Analytics Page Types
export interface TopEventData {
  _id: string;
  title: string;
  shortDescription: string;
  count: number;
}

export interface TopOrganizerData {
  _id: string;
  name: string;
  eventCount: number;
  totalRegistrations: number;
}

export interface TopUserData {
  _id: string;
  user: {
    name: string;
  } | null;
  xp: number;
  badges: string[];
  streak: number;
}

export interface AnalyticsData {
  topEvents: TopEventData[];
  topOrganizers: TopOrganizerData[];
  topUsers: TopUserData[];
}

export interface AnalyticsApiResponse {
  success: boolean;
  analytics: AnalyticsData;
}

export interface AnalyticsBadgeInfo {
  color: string;
  icon: string;
}

// Admin Profile Types
export interface AdminProfileData {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
  updatedAt: string;
}

export interface AdminLog {
  id?: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | string;
  targetType?: string;
  description?: string;
  details?: string;
  status: 'success' | 'error' | 'pending' | string;
}

export interface AdminTeamMember {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface AdminProfileApiResponse {
  success: boolean;
  profile: AdminProfileData;
}

export interface AdminLogsApiResponse {
  success: boolean;
  logs: AdminLog[];
}

export interface AdminTeamApiResponse {
  success: boolean;
  team: AdminTeamMember[];
}

export interface AdminProfilePictureResponse {
  success: boolean;
  profilePicture: string;
}

// Announcements Page Types
export interface AdminAnnouncement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface AnnouncementFormData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  expiresAt: string;
}

export interface DeleteModalState {
  isOpen: boolean;
  announcementId: string | null;
  title: string;
}

export interface AdminAnnouncementsApiResponse {
  success: boolean;
  announcements: AdminAnnouncement[];
}

export interface CreateAnnouncementApiResponse {
  success: boolean;
  announcement: AdminAnnouncement;
}

export interface DeleteAnnouncementApiResponse {
  success: boolean;
}

export interface UpdateAnnouncementApiResponse {
  success: boolean;
}

export interface AnnouncementsApiResponse {
  success: boolean;
  announcements: AdminAnnouncement[];
  message?: string;
}

// Internships Management Types
export interface AdminInternshipData {
  _id: string;
  title: string;
  startDate: string;
  endDate?: string;
  applicationDeadline: string;
  logo: string;
  poster?: string;
  organizer?: {
    name: string;
    organizerBrandLogo?: string;
  };
  organizerId?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
  category: string;
  type: string;
  status?: 'draft' | 'published' | 'closed' | 'completed';
  location: {
    type: 'remote' | 'on-site' | 'hybrid';
    city?: string;
    state?: string;
    country?: string;
  };
  compensation: {
    type: 'Paid' | 'Unpaid';
    amount: number;
    currency: string;
  };
  applicationCount: number;
  capacity: number;
  isPublished: boolean;
  isFeatured?: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // Allow additional properties for SearchAndFilter compatibility
}

export interface InternshipDeleteModalState {
  isOpen: boolean;
  internshipId: string | null;
  internshipTitle: string;
}

export interface InternshipFlagModalState {
  isOpen: boolean;
  internshipId: string | null;
  internshipTitle: string;
  isFlagged: boolean;
  flagReason: string;
}

export interface AdminInternshipsApiResponse {
  success: boolean;
  internships: AdminInternshipData[];
  message?: string;
}

export interface InternshipDeleteResponse {
  success: boolean;
  message?: string;
}

export interface InternshipFlagResponse {
  success: boolean;
  message?: string;
}

// Events Management Types
export interface AdminEventData {
  _id: string;
  title: string;
  date: string;
  poster: string;
  organizer?: {
    name: string;
  };
  category: string;
  isPublished: boolean;
  isFeatured?: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // Allow additional properties for SearchAndFilter compatibility
}

export interface EventDeleteModalState {
  isOpen: boolean;
  eventId: string | null;
  eventTitle: string;
}

export interface EventFlagModalState {
  isOpen: boolean;
  eventId: string | null;
  eventTitle: string;
  isFlagged: boolean;
  flagReason: string;
}

export interface AdminEventsApiResponse {
  success: boolean;
  events: AdminEventData[];
  message?: string;
}

export interface EventDeleteResponse {
  success: boolean;
  message?: string;
}

export interface EventFlagResponse {
  success: boolean;
  message?: string;
}

// Moderation Page Types
export interface FlaggedUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  status?: 'active' | 'suspended';
  flagReason?: string | null;
}

export interface FlaggedEvent {
  _id: string;
  title: string;
  poster: string;
  date: string;
  organizer?: {
    name: string;
  };
  flagReason?: string | null;
}

export interface FlaggedItems {
  users: FlaggedUser[];
  events: FlaggedEvent[];
}

export interface ModerationApiResponse {
  success: boolean;
  flaggedItems: FlaggedItems;
  message?: string;
}

export interface UnflagResponse {
  success: boolean;
  message?: string;
} 