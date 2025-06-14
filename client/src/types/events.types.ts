import type { Booking } from './core.types';

// Event Card specific event interface (compatible with Event but more flexible)
export interface EventCardData {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  date: string;
  startDate?: string;
  endDate?: string;
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
    state?: string;
    country?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  venue?: string;
  registrationCount: number;
  currentAttendees?: number;
  capacity: number;
  maxAttendees?: number;
  isSaved?: boolean;
  isOnline?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  animationDelay?: string;
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

// Event Form Data
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
  isPublished: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
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