import { useState, useEffect } from "react";
import axios from "axios";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    topEvents: [],
    topOrganizers: [],
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/admin/analytics");
        if (response.data.success) {
          setAnalytics(response.data.analytics);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Get badge icon and color based on badge name
  const getBadgeInfo = (badgeName) => {
    switch (badgeName) {
      case 'Newbie':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: '🌱' };
      case 'Regular':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: '🌟' };
      case 'Champ':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: '🏆' };
      case 'Veteran':
        return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: '🔥' };
      case 'Master':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: '👑' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: '❓' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Platform Analytics & Insights</h1>
          <a 
            href="/admin/dashboard" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </a>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Events Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top 5 Most Popular Events</h2>
              <div className="space-y-4">
                {analytics.topEvents && analytics.topEvents.length > 0 ? (
                  analytics.topEvents.map((event, index) => (
                    <div key={event._id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-md font-medium text-gray-800 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.shortDescription}
                        </p>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {event.count} registrations
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No event data available</p>
                )}
              </div>
            </div>

            {/* Top Organizers Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Performing Organizers</h2>
              <div className="space-y-4">
                {analytics.topOrganizers && analytics.topOrganizers.length > 0 ? (
                  analytics.topOrganizers.map((organizer, index) => (
                    <div key={organizer._id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-md font-medium text-gray-800 dark:text-white">{organizer.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {organizer.eventCount} events
                          </span>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            {organizer.totalRegistrations} registrations
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No organizer data available</p>
                )}
              </div>
            </div>

            {/* Top Users Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-5">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Leaderboard</h2>
              <div className="space-y-4">
                {analytics.topUsers && analytics.topUsers.length > 0 ? (
                  analytics.topUsers.map((userData, index) => {
                    const badgeInfo = userData.badges && userData.badges.length > 0 
                      ? getBadgeInfo(userData.badges[userData.badges.length - 1])
                      : getBadgeInfo('');
                    
                    return (
                      <div key={userData._id} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="flex flex-wrap items-center justify-between">
                            <h3 className="text-md font-medium text-gray-800 dark:text-white">
                              {userData.user ? userData.user.name : 'Unknown User'}
                            </h3>
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {userData.xp} XP
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {userData.badges && userData.badges.map((badge, i) => {
                              const { color, icon } = getBadgeInfo(badge);
                              return (
                                <span 
                                  key={i} 
                                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}
                                >
                                  {icon} {badge}
                                </span>
                              );
                            })}
                            {userData.streak > 0 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                🔥 {userData.streak} streak
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No user activity data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage; 