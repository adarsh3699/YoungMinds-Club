// Event Types and Categories Constants
// This file contains all the available event types and categories for consistent use across the application

export const EVENT_TYPES = [
	{ value: '', label: 'All Types' },
	{ value: 'Competition', label: 'Competition' },
	{ value: 'Concert', label: 'Concert' },
	{ value: 'Conference', label: 'Conference' },
	{ value: 'Exhibition', label: 'Exhibition' },
	{ value: 'Hackathon', label: 'Hackathon' },
	{ value: 'Meetup', label: 'Meetup' },
	{ value: 'MUN', label: 'Model United Nations (MUN)' },
	{ value: 'Networking', label: 'Networking Event' },
	{ value: 'Other', label: 'Other' },
	{ value: 'Seminar', label: 'Seminar' },
	{ value: 'Training', label: 'Training Session' },
	{ value: 'Webinar', label: 'Webinar' },
	{ value: 'Workshop', label: 'Workshop' },
];

export const EVENT_CATEGORIES = [
	{ value: '', label: 'All Categories' },
	{ value: 'Arts', label: 'Arts & Culture' },
	{ value: 'Business', label: 'Business' },
	{ value: 'Career', label: 'Career Development' },
	{ value: 'Design', label: 'Design & Creative' },
	{ value: 'Education', label: 'Education' },
	{ value: 'Entrepreneurship', label: 'Entrepreneurship' },
	{ value: 'Environment', label: 'Environment & Sustainability' },
	{ value: 'Finance', label: 'Finance & Investment' },
	{ value: 'Health', label: 'Health & Wellness' },
	{ value: 'Marketing', label: 'Marketing & Sales' },
	{ value: 'Music', label: 'Music & Entertainment' },
	{ value: 'Other', label: 'Other' },
	{ value: 'Science', label: 'Science & Research' },
	{ value: 'Social', label: 'Social & Community' },
	{ value: 'Sports', label: 'Sports & Fitness' },
	{ value: 'Technology', label: 'Technology' },
];

// Helper functions to get specific values
export const getEventTypeOptions = () => EVENT_TYPES;
export const getEventCategoryOptions = () => EVENT_CATEGORIES;

// Helper functions to get labels by value
export const getEventTypeLabel = (value) => {
	const eventType = EVENT_TYPES.find(type => type.value === value);
	return eventType ? eventType.label : value;
};

export const getEventCategoryLabel = (value) => {
	const category = EVENT_CATEGORIES.find(cat => cat.value === value);
	return category ? category.label : value;
}; 