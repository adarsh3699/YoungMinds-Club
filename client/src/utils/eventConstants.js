// Event Types and Categories Constants
// This file contains all the available event types and categories for consistent use across the application

export const EVENT_TYPES = [
	{ value: 'Conference', label: 'Conference' },
	{ value: 'Workshop', label: 'Workshop' },
	{ value: 'Meetup', label: 'Meetup' },
	{ value: 'Hackathon', label: 'Hackathon' },
	{ value: 'MUN', label: 'Model United Nations (MUN)' },
	{ value: 'Concert', label: 'Concert' },
	{ value: 'Seminar', label: 'Seminar' },
	{ value: 'Webinar', label: 'Webinar' },
	{ value: 'Competition', label: 'Competition' },
	{ value: 'Exhibition', label: 'Exhibition' },
	{ value: 'Networking', label: 'Networking Event' },
	{ value: 'Training', label: 'Training Session' },
	{ value: 'Other', label: 'Other' },
];

export const EVENT_CATEGORIES = [
	{ value: 'Technology', label: 'Technology' },
	{ value: 'Business', label: 'Business' },
	{ value: 'Education', label: 'Education' },
	{ value: 'Arts', label: 'Arts & Culture' },
	{ value: 'Science', label: 'Science & Research' },
	{ value: 'Music', label: 'Music & Entertainment' },
	{ value: 'Sports', label: 'Sports & Fitness' },
	{ value: 'Health', label: 'Health & Wellness' },
	{ value: 'Environment', label: 'Environment & Sustainability' },
	{ value: 'Social', label: 'Social & Community' },
	{ value: 'Career', label: 'Career Development' },
	{ value: 'Entrepreneurship', label: 'Entrepreneurship' },
	{ value: 'Finance', label: 'Finance & Investment' },
	{ value: 'Marketing', label: 'Marketing & Sales' },
	{ value: 'Design', label: 'Design & Creative' },
	{ value: 'Other', label: 'Other' },
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