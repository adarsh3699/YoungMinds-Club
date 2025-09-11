/**
 * Event field filtering utilities
 * Centralizes logic for filtering out system-managed fields during updates
 */

/**
 * Fields that should never be updated directly by users or admins
 */
const SYSTEM_MANAGED_FIELDS = [
    'analytics',
    'registrationCount', 
    'createdAt',
    'updatedAt',
    '_id',
    'organizer'  // Organizer should not be changed via event updates
];

/**
 * Fields that organizers cannot update (additional to system fields)
 */
const ORGANIZER_RESTRICTED_FIELDS = [
    'isFlagged',
    'flagReason',
    'isFeatured'
];

/**
 * Filter out restricted fields from update data
 * @param {Object} updateData - The data to filter
 * @param {string} userRole - 'organizer' or 'admin'
 * @returns {Object} Filtered update data
 */
function filterEventUpdateFields(updateData, userRole = 'organizer') {
    const filteredData = { ...updateData };
    
    // Remove system-managed fields for everyone
    SYSTEM_MANAGED_FIELDS.forEach(field => {
        delete filteredData[field];
    });
    
    // Remove additional restricted fields for organizers
    if (userRole === 'organizer') {
        ORGANIZER_RESTRICTED_FIELDS.forEach(field => {
            delete filteredData[field];
        });
    }
    
    return filteredData;
}

/**
 * Process location data from dot-notation to object format
 * @param {Object} reqBody - Request body containing potential location.* fields
 * @returns {Object} Processed location object and cleaned body
 */
function processLocationData(reqBody) {
    const location = {};
    const cleanedBody = { ...reqBody };
    
    // Extract location fields
    Object.keys(reqBody).forEach(key => {
        if (key.startsWith('location.')) {
            const locationKey = key.split('.')[1];
            location[locationKey] = reqBody[key];
            delete cleanedBody[key];
        }
    });
    
    return {
        location: Object.keys(location).length > 0 ? location : null,
        cleanedBody
    };
}

module.exports = {
    filterEventUpdateFields,
    processLocationData,
    SYSTEM_MANAGED_FIELDS,
    ORGANIZER_RESTRICTED_FIELDS
}; 