/**
 * Format a date for display
 * @param {string|Date} dateString - Date string or Date object
 * @param {boolean} includeTime - Whether to include time in the formatted date
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'TBA';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  
  // Use different units based on the time difference
  let time, unit;
  
  if (absSeconds < 60) {
    time = absSeconds;
    unit = 'second';
  } else if (absSeconds < 3600) {
    time = Math.floor(absSeconds / 60);
    unit = 'minute';
  } else if (absSeconds < 86400) {
    time = Math.floor(absSeconds / 3600);
    unit = 'hour';
  } else if (absSeconds < 2592000) {
    time = Math.floor(absSeconds / 86400);
    unit = 'day';
  } else if (absSeconds < 31536000) {
    time = Math.floor(absSeconds / 2592000);
    unit = 'month';
  } else {
    time = Math.floor(absSeconds / 31536000);
    unit = 'year';
  }
  
  // Add plural 's' if time is not 1
  if (time !== 1) {
    unit += 's';
  }
  
  // Format as "X [unit] ago" or "in X [unit]"
  return diffInSeconds < 0 ? `${time} ${unit} ago` : `in ${time} ${unit}`;
};

/**
 * Format a date range (e.g., "Jan 1 - Jan 5, 2023")
 * @param {string|Date} startDate - Start date string or Date object
 * @param {string|Date} endDate - End date string or Date object
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'TBA';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date range';
  
  // If dates are in the same year
  if (start.getFullYear() === end.getFullYear()) {
    // If dates are in the same month
    if (start.getMonth() === end.getMonth()) {
      // If dates are the same day
      if (start.getDate() === end.getDate()) {
        return start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
      
      // Same month, different days
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    }
    
    // Same year, different months
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  
  // Different years
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}; 