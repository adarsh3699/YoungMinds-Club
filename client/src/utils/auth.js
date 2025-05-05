// Authentication utility functions

/**
 * Set a token in localStorage
 * @param {string} token - The JWT token
 */
export const setToken = (token) => {
    localStorage.setItem('jwtToken', token);
};

/**
 * Get the token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
    return localStorage.getItem('jwtToken');
};

/**
 * Remove the token from localStorage
 */
export const removeToken = () => {
    localStorage.removeItem('jwtToken');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user has a token, false otherwise
 */
export const isAuthenticated = () => {
    return !!getToken();
}; 