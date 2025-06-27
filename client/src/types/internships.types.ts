// Types for internship-related data structures

// Internship Card specific internship interface
export interface InternshipCardData {
  id?: string;
  _id?: string;
  title: string;
  internshipDescription?: string;
  companyDescription?: string;
  startDate: string;
  endDate?: string;
  applicationDeadline: string;
  logo?: string;
  companyLogo?: string;
  type: string;
  category?: string;
  compensation?: {
    type: 'Paid' | 'Unpaid';
    amount: number;
    currency: string;
  };
  stipend?: number;
  company?: {
    name?: string;
    _id?: string;
  };
  location?: {
    type?: 'remote' | 'on-site' | 'hybrid';
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  applicationCount: number;
  maxApplications?: number;
  capacity: number;
  isSaved?: boolean;
  isRemote?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  duration?: string;
  requirements?: string[];
  skills?: string[];
  animationDelay?: string;
}

// Internship Card Props
export interface InternshipCardProps {
  internship: InternshipCardData;
  isFeatured?: boolean;
  isRecruiter?: boolean;
  onManage?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveToggle?: (internshipId: string, isSaved: boolean) => void;
}

// Internship Form Data
export interface InternshipFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  location: string;
  category: string;
  type: string;
  maxApplications: number;
  stipend: number;
  compensation: string;
  duration: string;
  companyLogo?: File | string;
  tags?: string[];
  requirements?: string[];
  skills?: string[];
}

// Internship Details Page Types
export interface InternshipLocation {
  type: 'remote' | 'on-site' | 'hybrid';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface InternshipCompany {
  _id?: string;
  name: string;
  email: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface InternshipDetailsData {
  _id: string;
  title: string;
  internshipDescription?: string;
  companyDescription?: string;
  startDate: string;
  endDate?: string;
  applicationDeadline: string;
  location: InternshipLocation;
  category: string;
  type: string;
  compensation: {
    type: 'Paid' | 'Unpaid';
    amount: number;
    currency: string;
  };
  stipend?: number;
  duration: string;
  logo: string;
  company: InternshipCompany;
  applicationCount: number;
  capacity: number;
  tags?: string[];
  requirements?: string[];
  skills?: string[];
  responsibilities?: string[];
  benefits?: string[];
  status: 'draft' | 'published' | 'closed' | 'completed';
  isPublished: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Internship Application Response Types
export interface InternshipApplicationResponse {
  success: boolean;
  message: string;
  xp?: number;
  application?: unknown;
}

export interface InternshipSaveResponse {
  success: boolean;
  message: string;
  isSaved: boolean;
}

export interface UserInternshipsResponse {
  success: boolean;
  internships?: Array<{ id: string; title: string; startDate: string }>;
  savedInternships?: Array<{ id: string; title: string; startDate: string }>;
}

// Internship Details Component Props
export interface InternshipDetailsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Internship Discovery Page Types
export interface InternshipDiscoverFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  selectedType: string;
  selectedDuration: string;
  selectedCompensation: string;
  isRemoteOnly: boolean;
  dateRange: InternshipDateRange;
  sortBy: string;
}

export interface InternshipDateRange {
  start: string;
  end: string;
}

export interface InternshipsApiResponse {
  success: boolean;
  internships: InternshipCardData[];
  message?: string;
}

// Internship Discovery Component Props
export interface InternshipDiscoverProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Internship Card Component with Discover-specific properties
export interface InternshipDiscoverData extends InternshipCardData {
  _id: string;
  createdAt: string;
  isRemote?: boolean;
  location: {
    city?: string;
    type?: 'remote' | 'on-site' | 'hybrid';
    state?: string;
    country?: string;
  };
  tags?: string[];
}

// Date Change Handler Type
export type InternshipDateChangeField = 'start' | 'end';

// Internship Handler Types for InternshipDiscover
export interface InternshipDiscoverHandlers {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoryChange: (e: { target: { value: string } }) => void;
  handleLocationChange: (e: { target: { value: string } }) => void;
  handleTypeChange: (e: { target: { value: string } }) => void;
  handleDurationChange: (e: { target: { value: string } }) => void;
  handleCompensationChange: (e: { target: { value: string } }) => void;
  handleRemoteToggle: (e: { target: { checked: boolean } }) => void;
  handleSortChange: (e: { target: { value: string } }) => void;
  handleDateChange: (field: InternshipDateChangeField, value: string) => void;
  handleSaveToggle: (internshipId: string, isSaved: boolean) => Promise<void>;
  resetFilters: () => void;
} 