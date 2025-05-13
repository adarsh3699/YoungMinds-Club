import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
import XPProgressBar from '../components/XPProgressBar';
import { Tabs } from '../components/common';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MyEvents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [activeTab, setActiveTab] = useState('registered');
  
  // Load user events data
  useEffect(() => {
    const fetchUserEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/user/events');
        setUserActivity(response.data);
      } catch (error) {
        console.error('Error fetching user events:', error);
        setError('Failed to load your events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEvents();
  }, []);
  
  // Handle removing a saved event
  const handleRemoveSaved = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/save`);
      
      // Update the UI to reflect the change
      setUserActivity(prev => ({
        ...prev,
        savedEvents: prev.savedEvents.filter(event => event.id !== eventId)
      }));
    } catch (error) {
      console.error('Error removing saved event:', error);
    }
  };
  
  // Format events for rendering
  const formatEvents = (events) => {
    return events.map(event => ({
      ...event,
      _id: event.id // Ensure _id exists for EventCard component
    }));
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold">Loading your events...</h2>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }
  
  // Show empty state if no user activity
  if (!userActivity) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">My Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't saved or registered for any events yet.</p>
          <Link 
            to="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  // Prepare tab content for HeadlessUI Tabs component
  const tabsContent = [
    {
      key: 'registered',
      label: 'Registered Events',
      content: (
        <div>
          {userActivity.registeredEvents.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No registered events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't registered for any events yet.</p>
              <Link 
                to="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formatEvents(userActivity.registeredEvents).map((event) => (
                <div key={event._id} className="flex flex-col h-full">
                  <EventCard 
                    event={event} 
                    showActions={false}
                  />
                  <div className="mt-2 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Registered:</span> {new Date(event.registeredAt).toLocaleDateString()}
                    </p>
                    {event.feedback?.given ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Feedback:</span> 
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${i < event.feedback.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link 
                        to={`/event/${event._id}/feedback`}
                        className="inline-block mt-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Give feedback (+5 XP)
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'saved',
      label: 'Saved Events',
      content: (
        <div>
          {userActivity.savedEvents.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No saved events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't saved any events for later.</p>
              <Link 
                to="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formatEvents(userActivity.savedEvents).map((event) => (
                <div key={event._id} className="relative">
                  <button
                    onClick={() => handleRemoveSaved(event._id)}
                    className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Remove from saved"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <EventCard 
                    event={event}
                    isSaved={true}
                    onSaveToggle={() => handleRemoveSaved(event._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{user?.email}</p>
            <div className="flex items-center">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">
                {userActivity.badge}
              </span>
              {userActivity.streakCount > 0 && (
                <span className="ml-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  {userActivity.streakCount} Weekend Streak
                </span>
              )}
            </div>
          </div>
          
          {/* XP Section */}
          <div className="md:w-1/3 w-full">
            <h2 className="text-lg font-semibold mb-2">Your XP Progress</h2>
            <XPProgressBar xp={userActivity.xp} />
          </div>
        </div>
        
        {/* Event Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userActivity.registeredEvents.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Registered Events</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userActivity.savedEvents.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Saved Events</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userActivity.xp}</p>
            <p className="text-gray-600 dark:text-gray-400">Total XP</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {userActivity.registeredEvents.filter(event => event.feedback?.given).length}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Feedback Given</p>
          </div>
        </div>
      </div>
      
      {/* Tabs using HeadlessUI */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <Tabs tabs={tabsContent} />
      </div>
      
      {/* Leaderboard Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">XP Leaderboard</h2>
          <p className="text-indigo-200">Top event goers this month</p>
        </div>
        
        <LeaderboardSection />
      </div>
    </div>
  );
};

// Leaderboard Component
const LeaderboardSection = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/user/leaderboard');
        setLeaderboard(response.data.leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }
  
  if (leaderboard.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No leaderboard data available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Badge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streak</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((item, index) => (
              <tr key={index} className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {index === 0 ? (
                    <span className="text-yellow-500 font-bold">🥇 1st</span>
                  ) : index === 1 ? (
                    <span className="text-gray-500 dark:text-gray-400 font-bold">🥈 2nd</span>
                  ) : index === 2 ? (
                    <span className="text-amber-700 dark:text-amber-500 font-bold">🥉 3rd</span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">{index + 1}th</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-800 dark:text-indigo-300 font-medium">
                      {item.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium">{item.user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold">{item.xp} XP</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300">
                    {item.badge}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {item.streakCount > 0 ? (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      {item.streakCount}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyEvents; 