import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EventCard from '../components/EventCard';
import XPProgressBar from '../components/XPProgressBar';

const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [tag, setTag] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Categories and tag options
  const categories = ['Technology', 'Business', 'Education', 'Arts', 'Science', 'Music', 'Sports', 'Other'];
  const popularTags = ['MUN', 'Hackathon', 'Workshop', 'Conference', 'Networking', 'Career'];
  
  // Load user profile and events
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user profile with XP and badge
        const profileResponse = await axios.get('/user/dashboard');
        setUserProfile(profileResponse.data.profile);
        
        // Get recommended events
        const recommendedResponse = await axios.get('/events/recommended');
        setRecommendedEvents(recommendedResponse.data.events);
        
        // Get all events with default filters
        await fetchEvents();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch events with filters
  const fetchEvents = async (page = 1) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (searchQuery) queryParams.append('search', searchQuery);
      if (category) queryParams.append('category', category);
      if (city) queryParams.append('city', city);
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      if (tag) queryParams.append('tag', tag);
      
      // Add pagination
      queryParams.append('page', page);
      queryParams.append('limit', 9); // 9 events per page
      
      const response = await axios.get(`/events?${queryParams.toString()}`);
      
      setEvents(response.data.events);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    }
  };
  
  // Handle search and filter changes
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchEvents(1);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setCity('');
    setDateRange({ startDate: '', endDate: '' });
    setTag('');
    setCurrentPage(1);
    fetchEvents(1);
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchEvents(newPage);
    }
  };
  
  // Handle saving/unsaving event
  const handleSaveToggle = (eventId, isSaved) => {
    // Update the UI to reflect saved state
    setEvents(events.map(event => 
      event._id === eventId ? { ...event, isSaved } : event
    ));
    
    setRecommendedEvents(recommendedEvents.map(event => 
      event._id === eventId ? { ...event, isSaved } : event
    ));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Profile Section */}
      {userProfile && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name}!</h1>
              <p className="text-gray-600 dark:text-gray-300">Find exciting events and earn XP to level up your profile!</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{userProfile.badge}</p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </div>
          </div>
          
          <XPProgressBar xp={userProfile.xp} />
          
          {userProfile.streakCount > 0 && (
            <div className="mt-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 dark:text-yellow-300">
                {userProfile.streakCount} weekend streak! Keep attending events to earn bonus XP!
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Find Events</h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search events, tags or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>
            
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">All Tags</option>
                {popularTags.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
            >
              Search
            </button>
            
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Recommended Events Section */}
      {recommendedEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedEvents.slice(0, 3).map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* All Events Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Discover Events</h2>
        
        {events.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search filters or check back later!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border ${
                      currentPage === 1 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border-gray-300 dark:border-gray-600`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages).keys()].map((number) => (
                    <button
                      key={number + 1}
                      onClick={() => handlePageChange(number + 1)}
                      className={`px-3 py-1 border-t border-b border-gray-300 dark:border-gray-600 ${
                        currentPage === number + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r-md border ${
                      currentPage === totalPages
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } border-gray-300 dark:border-gray-600`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
