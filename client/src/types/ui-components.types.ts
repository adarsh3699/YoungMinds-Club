// Component Props Types
export interface ButtonProps {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "danger" | "outline";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	loading?: boolean;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
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
	type?: "text" | "email" | "password" | "number" | "date" | "datetime-local" | "time" | "url" | "tel";
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
	showPasswordToggle?: boolean; // New prop for password visibility toggle
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
	required?: boolean;
}

// TextareaField Props
export interface TextareaFieldProps {
	id?: string;
	name: string;
	value: string;
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	label?: string;
	error?: string;
	placeholder?: string;
	required?: boolean;
	rows?: number;
	maxLength?: number;
	className?: string;
	expandable?: boolean;
	minRows?: number;
	maxRows?: number;
	hideLabel?: boolean;
	disabled?: boolean;
	hideCharCountInLabel?: boolean;
}

// Switch Props
export interface SwitchProps {
	enabled?: boolean;
	onChange?: (event: SwitchChangeEvent) => void;
	label?: string;
	description?: string;
	name?: string;
	srLabel?: string;
	size?: "small" | "default" | "large";
}

// Switch change event type
export interface SwitchChangeEvent {
	target: {
		name?: string;
		value: boolean;
		type: "checkbox";
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
	position?: "top" | "bottom" | "left" | "right";
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
