// Internship Types and Categories Constants
// This file contains all the available internship types and categories for consistent use across the application

export const INTERNSHIP_TYPES = [
	{ value: '', label: 'All Types' },
	{ value: 'Full-time', label: 'Full-time' },
	{ value: 'Part-time', label: 'Part-time' },
	{ value: 'Remote', label: 'Remote' },
	{ value: 'Hybrid', label: 'Hybrid' },
	{ value: 'On-site', label: 'On-site' },
	{ value: 'Project-based', label: 'Project-based' },
	{ value: 'Research', label: 'Research' },
	{ value: 'Summer', label: 'Summer Internship' },
	{ value: 'Winter', label: 'Winter Internship' },
	{ value: 'Other', label: 'Other' },
];

export const INTERNSHIP_CATEGORIES = [
	{ value: '', label: 'All Categories' },
	{ value: 'Technology', label: 'Technology & Software' },
	{ value: 'Business', label: 'Business & Management' },
	{ value: 'Marketing', label: 'Marketing & Sales' },
	{ value: 'Design', label: 'Design & Creative' },
	{ value: 'Finance', label: 'Finance & Banking' },
	{ value: 'Engineering', label: 'Engineering' },
	{ value: 'Data Science', label: 'Data Science & Analytics' },
	{ value: 'Content', label: 'Content & Writing' },
	{ value: 'HR', label: 'Human Resources' },
	{ value: 'Legal', label: 'Legal' },
	{ value: 'Healthcare', label: 'Healthcare' },
	{ value: 'Education', label: 'Education & Training' },
	{ value: 'Research', label: 'Research & Development' },
	{ value: 'Consulting', label: 'Consulting' },
	{ value: 'Nonprofit', label: 'Nonprofit & Social Impact' },
	{ value: 'Media', label: 'Media & Communications' },
	{ value: 'Other', label: 'Other' },
];

export const INTERNSHIP_DURATION = [
	{ value: '', label: 'All Durations' },
	{ value: '1-2 months', label: '1-2 months' },
	{ value: '3-4 months', label: '3-4 months' },
	{ value: '5-6 months', label: '5-6 months' },
	{ value: '6+ months', label: '6+ months' },
	{ value: 'Flexible', label: 'Flexible' },
];

export const INTERNSHIP_COMPENSATION = [
	{ value: '', label: 'All Compensation' },
	{ value: 'Paid', label: 'Paid' },
	{ value: 'Unpaid', label: 'Unpaid' },
	{ value: 'Stipend', label: 'Stipend' },
	{ value: 'Certificate', label: 'Certificate Only' },
	{ value: 'Experience', label: 'Experience Letter' },
];

// Helper functions to get specific values
export const getInternshipTypeOptions = () => INTERNSHIP_TYPES;
export const getInternshipCategoryOptions = () => INTERNSHIP_CATEGORIES;
export const getInternshipDurationOptions = () => INTERNSHIP_DURATION;
export const getInternshipCompensationOptions = () => INTERNSHIP_COMPENSATION;

// Helper functions to get labels by value
export const getInternshipTypeLabel = (value) => {
	const internshipType = INTERNSHIP_TYPES.find((type) => type.value === value);
	return internshipType ? internshipType.label : value;
};

export const getInternshipCategoryLabel = (value) => {
	const category = INTERNSHIP_CATEGORIES.find((cat) => cat.value === value);
	return category ? category.label : value;
};

export const getInternshipDurationLabel = (value) => {
	const duration = INTERNSHIP_DURATION.find((dur) => dur.value === value);
	return duration ? duration.label : value;
};

export const getInternshipCompensationLabel = (value) => {
	const compensation = INTERNSHIP_COMPENSATION.find((comp) => comp.value === value);
	return compensation ? compensation.label : value;
};

// Aliases for backward compatibility
export const COMPENSATION_TYPES = INTERNSHIP_COMPENSATION;
export const INTERNSHIP_DURATIONS = INTERNSHIP_DURATION;
