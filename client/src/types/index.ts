// User Types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'organizer' | 'admin';
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
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer: User | string;
  attendees: User[] | string[];
  tags?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

// Event Card specific event interface (compatible with Event but more flexible)
export interface EventCardData {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  date: string;
  eventDate?: string;
  poster?: string;
  eventImage?: string;
  type: string;
  category?: string;
  price?: number;
  ticketPrice?: number;
  organizer?: {
    name?: string;
    _id?: string;
  };
  location?: {
    type?: 'online' | 'offline';
    city?: string;
    venue?: string;
  };
  venue?: string;
  registrationCount: number;
  currentAttendees?: number;
  capacity: number;
  maxAttendees?: number;
  isSaved?: boolean;
}

// Countdown type for event card timer
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Event Card Props
export interface EventCardProps {
  event: EventCardData;
  isFeatured?: boolean;
  isOrganizer?: boolean;
  onManage?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveToggle?: (eventId: string, isSaved: boolean) => void;
}

// Booking/Ticket Types
export interface Booking {
  _id: string;
  event: Event | string;
  user: User | string;
  bookingDate: string;
  status: 'booked' | 'cancelled' | 'attended';
  qrCode?: string;
  ticketNumber: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
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

// Form Data Types
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: 'user' | 'organizer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  category: string;
  maxAttendees: number;
  ticketPrice: number;
  eventImage?: File | string;
  tags?: string[];
  requirements?: string[];
}

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

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  titleClassName?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Form Input Props
export interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'time' | 'url' | 'tel';
  id?: string;
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  min?: string | number;
  max?: string | number;
  className?: string;
  style?: React.CSSProperties;
  step?: string | number;
  tooltip?: string;
  disabled?: boolean;
  allowNegative?: boolean;
}

// Select Option Interface
export interface SelectOption {
  value: string | number;
  label: string;
}

// Select Input Props
export interface SelectInputProps {
  id?: string;
  name: string;
  value: string | number;
  onChange: (event: { target: { name: string; value: string | number } }) => void;
  label?: string;
  options: SelectOption[];
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

// TextareaField Props
export interface TextareaFieldProps {
  id?: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  expandable?: boolean;
  minRows?: number;
  maxRows?: number;
}

// Switch Props
export interface SwitchProps {
  enabled?: boolean;
  onChange?: (event: SwitchChangeEvent) => void;
  label?: string;
  description?: string;
  name?: string;
  srLabel?: string;
  size?: 'small' | 'default' | 'large';
}

// Switch change event type
export interface SwitchChangeEvent {
  target: {
    name?: string;
    value: boolean;
    type: 'checkbox';
    checked: boolean;
  };
}

// Accordion Item Interface
export interface AccordionItem {
  key?: string;
  title: string;
  content: React.ReactNode;
}

// Accordion Props
export interface AccordionProps {
  items: AccordionItem[];
}

// EventCardSkeleton Props (simple component, no props needed)
export interface EventCardSkeletonProps {}

// DateTimePicker Props
export interface DateTimePickerProps {
  id?: string;
  name: string;
  value: string | Date | null;
  onChange: (event: { target: { name: string; value: string } }) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showTimeSelect?: boolean;
  timeIntervals?: number;
}

// Time Option Interface for DateTimePicker
export interface TimeOption {
  display: string;
  value: string;
}

// DateTimePicker Custom Header Props
export interface CustomHeaderProps {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}

// Logo Props
export interface LogoProps {
  className?: string;
}

// Tooltip Props
export interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Tab Item Interface
export interface TabItem {
  id: string;
  key?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// Tabs Props
export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

// Search and Filter Configuration Types
export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterConfig {
  searchPlaceholder: string;
  itemType: string; // 'users', 'events', 'organizers', etc.
  categoryOptions?: FilterOption[]; // For events: Technology, Business, etc.
  statusOptions?: FilterOption[]; // For all types: Active, Suspended, etc.
  roleOptions?: FilterOption[]; // For users: Admin, User, Organizer
  customFilters?: {
    name: string;
    options: FilterOption[];
    placeholder?: string;
  }[];
  showCategory?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
}

// Generic Search Filters Props - replaces UserSearchFiltersProps
export interface GenericSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredCount: number;
  totalCount: number;
  animationDelay?: string;
  config: SearchFilterConfig;
  // Optional filters
  roleFilter?: string;
  setRoleFilter?: (role: string) => void;
  categoryFilter?: string;
  setCategoryFilter?: (category: string) => void;
  customFilters?: Record<string, string>;
  setCustomFilter?: (filterName: string, value: string) => void;
}

// Backward compatibility interface
export interface UserSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter?: string;
  setRoleFilter?: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredCount: number;
  totalCount: number;
  animationDelay?: string;
  // Dynamic props for different data types
  categoryFilter?: string;
  setCategoryFilter?: (category: string) => void;
  itemType?: string;
  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  roleOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  showRole?: boolean;
  showCategory?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  message?: string;
}

// Route Types
export interface ProtectedRouteProps {
  requiredRole?: 'user' | 'organizer' | 'admin' | ('user' | 'organizer' | 'admin')[];
  redirectPath?: string;
}

// Message Alert Props (New preferred interface)
export interface MsgAlertProps {
  message: string | null;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

// @deprecated - Use MsgAlertProps instead. Kept for backward compatibility.
export interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
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

// User Card Props
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

// Loading Component Props
export interface LoadingComponentProps {}

// Admin Table Header Configuration
export interface AdminTableColumn {
  key: string;
  label: string;
  className?: string;
}

// Admin Table Props (formerly UsersTableProps)
export interface AdminTableProps {
  loading: boolean;
  filteredItems: any[];
  searchTerm: string;
  roleFilter?: string;
  statusFilter: string;
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
  filteredUsers: any[];
  searchTerm: string;
  roleFilter?: string;
  statusFilter: string;
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

// Organizer Application Types
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

// Contact Form Types
export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactProps {}

// Event Details Page Types
export interface EventLocation {
  type: 'online' | 'offline';
  venue?: string;
  address?: string;
  city?: string;
  onlineUrl?: string;
}

export interface EventOrganizer {
  _id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
}

export interface EventDetailsData {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  date: string;
  endDate?: string;
  location: EventLocation;
  category: string;
  type: string;
  price: number;
  poster: string;
  organizer: EventOrganizer;
  registrationDeadline?: string;
  registrationCount: number;
  capacity: number;
  tags?: string[];
  requirements?: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Event Registration Response Types
export interface EventRegistrationResponse {
  success: boolean;
  message: string;
  xp?: number;
  booking?: Booking;
}

export interface EventSaveResponse {
  success: boolean;
  message: string;
  isSaved: boolean;
}

export interface UserEventsResponse {
  success: boolean;
  events?: Array<{ id: string; title: string; date: string }>;
  savedEvents?: Array<{ id: string; title: string; date: string }>;
}

// Event Details Component Props
export interface EventDetailsProps {}

// Event Discovery Page Types
export interface EventDiscoverFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  isOnlineOnly: boolean;
  dateRange: DateRange;
  sortBy: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface EventsApiResponse {
  success: boolean;
  events: EventCardData[];
  message?: string;
}

// Event Discovery Component Props
export interface EventDiscoverProps {}

// Event Card Component with Discover-specific properties
export interface EventDiscoverData extends EventCardData {
  _id: string;
  createdAt: string;
  isOnline?: boolean;
  location: {
    city?: string;
    type?: 'online' | 'offline';
    venue?: string;
  };
  tags?: string[];
}

// Date Change Handler Type
export type DateChangeField = 'start' | 'end';

// Event Handler Types for EventDiscover
export interface EventDiscoverHandlers {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoryChange: (e: { target: { value: string } }) => void;
  handleLocationChange: (e: { target: { value: string } }) => void;
  handleOnlineToggle: (e: { target: { checked: boolean } }) => void;
  handleSortChange: (e: { target: { value: string } }) => void;
  handleDateChange: (field: DateChangeField, value: string) => void;
  handleSaveToggle: (eventId: string, isSaved: boolean) => Promise<void>;
  resetFilters: () => void;
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

export interface AdminAnnouncementsApiResponse {
  success: boolean;
  announcements: AdminAnnouncement[];
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
export interface UserDashboardProps {}

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

// Organizer Dashboard Types
export interface OrganizerDashboardData {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  upcomingEvents: number;
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

export interface FilterOption {
  value: string;
  label: string;
}

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
  onCreateEvent: () => void;
  dashboardData: OrganizerDashboardData | null;
  calculatedTotalRegistrations: number;
  feedbackSummary: OrganizerFeedbackSummary | null;
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
  profilePicture?: string;
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
  profilePicture: string;
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
  announcements: Announcement[];
  message?: string;
}

export interface RecommendedEventsApiResponse {
  success: boolean;
  events: EventCardData[];
  message?: string;
}

// User Management Types
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

// Organizers Management Types
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