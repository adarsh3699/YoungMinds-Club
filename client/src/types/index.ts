// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
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
  firstName: string;
  lastName: string;
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
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  min?: string | number;
  max?: string | number;
  className?: string;
  step?: string | number;
  tooltip?: string;
  disabled?: boolean;
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
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// Tabs Props
export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string;
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

// Error Alert Props
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

// Dashboard Header Props
export interface DashboardHeaderProps {}

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

// Users Table Props
export interface UsersTableProps {
  loading: boolean;
  filteredUsers: any[];
  searchTerm: string;
  roleFilter?: string;
  statusFilter: string;
  renderUserRow: (userData: any, index: number) => React.ReactNode;
  animationDelay?: string;
}

// Empty State Props
export interface EmptyStateProps {
  hasFilters: boolean;
}

// Table Header Props
export interface TableHeaderProps {}

// Loading Spinner Props  
export interface LoadingSpinnerProps {}

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